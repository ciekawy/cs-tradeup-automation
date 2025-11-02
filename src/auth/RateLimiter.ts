import fs from 'fs/promises';
import path from 'path';
import { RateLimitError } from './errors';

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  volumeFilePath?: string; // Path to volume tracking file
  dailyLimit?: number; // Max daily auth attempts
  monthlyLimit?: number; // Max monthly auth attempts
}

/**
 * Volume tracking data structure
 */
interface VolumeData {
  daily: {
    date: string; // ISO date string (YYYY-MM-DD)
    count: number;
  };
  monthly: {
    month: string; // ISO month string (YYYY-MM)
    count: number;
  };
}

/**
 * Rate limiter for authentication attempts
 *
 * Tracks daily and monthly authentication attempts to prevent
 * Steam ban detection. Persists counts to disk for durability.
 */
export class RateLimiter {
  private config: Required<RateLimiterConfig>;
  private volumeData: VolumeData;
  private initialized: boolean = false;

  constructor(config?: RateLimiterConfig) {
    this.config = {
      volumeFilePath: config?.volumeFilePath || '/data/volume.json',
      dailyLimit: config?.dailyLimit || parseInt(process.env.MAX_DAILY_AUTH_ATTEMPTS || '10'),
      monthlyLimit:
        config?.monthlyLimit || parseInt(process.env.MAX_MONTHLY_AUTH_ATTEMPTS || '100'),
    };

    // Initialize with empty data (will be loaded on first use)
    this.volumeData = this.getEmptyVolumeData();
  }

  /**
   * Initialize rate limiter by loading existing volume data
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await this.loadVolumeData();
      this.initialized = true;
    } catch (error) {
      // If file doesn't exist or is corrupted, start fresh
      console.log('[RateLimiter] Initializing with fresh volume data');
      this.volumeData = this.getEmptyVolumeData();
      await this.saveVolumeData();
      this.initialized = true;
    }
  }

  /**
   * Check if rate limits have been exceeded
   *
   * @returns true if limits exceeded, false otherwise
   */
  async isLimitExceeded(): Promise<boolean> {
    await this.ensureInitialized();
    this.rotateCounters();

    const dailyExceeded = this.volumeData.daily.count >= this.config.dailyLimit;
    const monthlyExceeded = this.volumeData.monthly.count >= this.config.monthlyLimit;

    if (dailyExceeded || monthlyExceeded) {
      console.warn(
        `[RateLimiter] Rate limit ${dailyExceeded ? 'DAILY' : 'MONTHLY'} exceeded: ` +
          `daily=${this.volumeData.daily.count}/${this.config.dailyLimit}, ` +
          `monthly=${this.volumeData.monthly.count}/${this.config.monthlyLimit}`
      );
    }

    return dailyExceeded || monthlyExceeded;
  }

  /**
   * Increment authentication attempt counters
   *
   * @throws RateLimitError if limits would be exceeded
   */
  async increment(): Promise<void> {
    await this.ensureInitialized();
    this.rotateCounters();

    // Check if incrementing would exceed limits
    const wouldExceedDaily = this.volumeData.daily.count + 1 > this.config.dailyLimit;
    const wouldExceedMonthly = this.volumeData.monthly.count + 1 > this.config.monthlyLimit;

    if (wouldExceedDaily || wouldExceedMonthly) {
      throw new RateLimitError(
        `Authentication rate limit exceeded: ` +
          `daily=${this.volumeData.daily.count}/${this.config.dailyLimit}, ` +
          `monthly=${this.volumeData.monthly.count}/${this.config.monthlyLimit}`,
        this.config.dailyLimit,
        this.config.monthlyLimit,
        this.volumeData.daily.count,
        this.volumeData.monthly.count
      );
    }

    // Increment counters
    this.volumeData.daily.count++;
    this.volumeData.monthly.count++;

    // Persist to disk
    await this.saveVolumeData();

    console.log(
      `[RateLimiter] Auth attempt tracked: ` +
        `daily=${this.volumeData.daily.count}/${this.config.dailyLimit}, ` +
        `monthly=${this.volumeData.monthly.count}/${this.config.monthlyLimit}`
    );
  }

  /**
   * Get current volume statistics
   */
  async getStats(): Promise<{
    daily: { count: number; limit: number; date: string };
    monthly: { count: number; limit: number; month: string };
  }> {
    await this.ensureInitialized();
    this.rotateCounters();

    return {
      daily: {
        count: this.volumeData.daily.count,
        limit: this.config.dailyLimit,
        date: this.volumeData.daily.date,
      },
      monthly: {
        count: this.volumeData.monthly.count,
        limit: this.config.monthlyLimit,
        month: this.volumeData.monthly.month,
      },
    };
  }

  /**
   * Reset volume counters (for testing)
   */
  async reset(): Promise<void> {
    this.volumeData = this.getEmptyVolumeData();
    await this.saveVolumeData();
  }

  /**
   * Load volume data from disk
   */
  private async loadVolumeData(): Promise<void> {
    const data = await fs.readFile(this.config.volumeFilePath, 'utf-8');
    const parsed = JSON.parse(data) as VolumeData;

    // Validate structure
    if (!parsed.daily || !parsed.monthly || !parsed.daily.date || !parsed.monthly.month) {
      throw new Error('Invalid volume data structure');
    }

    this.volumeData = parsed;
  }

  /**
   * Save volume data to disk
   */
  private async saveVolumeData(): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(this.config.volumeFilePath);
    await fs.mkdir(dir, { recursive: true });

    // Write with pretty formatting for debugging
    await fs.writeFile(
      this.config.volumeFilePath,
      JSON.stringify(this.volumeData, null, 2),
      'utf-8'
    );
  }

  /**
   * Rotate counters if date/month has changed
   */
  private rotateCounters(): void {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentMonth = currentDate.substring(0, 7); // YYYY-MM

    // Rotate daily counter
    if (this.volumeData.daily.date !== currentDate) {
      console.log(
        `[RateLimiter] Rotating daily counter (${this.volumeData.daily.date} -> ${currentDate})`
      );
      this.volumeData.daily.date = currentDate;
      this.volumeData.daily.count = 0;
    }

    // Rotate monthly counter
    if (this.volumeData.monthly.month !== currentMonth) {
      console.log(
        `[RateLimiter] Rotating monthly counter (${this.volumeData.monthly.month} -> ${currentMonth})`
      );
      this.volumeData.monthly.month = currentMonth;
      this.volumeData.monthly.count = 0;
    }
  }

  /**
   * Get empty volume data initialized with current date/month
   */
  private getEmptyVolumeData(): VolumeData {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentMonth = currentDate.substring(0, 7); // YYYY-MM

    return {
      daily: {
        date: currentDate,
        count: 0,
      },
      monthly: {
        month: currentMonth,
        count: 0,
      },
    };
  }

  /**
   * Ensure rate limiter is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}
