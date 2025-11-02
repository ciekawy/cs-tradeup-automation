/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { RateLimiter } from '../src/auth/RateLimiter';
import { RateLimitError } from '../src/auth/errors';

describe('RateLimiter', () => {
  const testVolumeFile = path.join(__dirname, '../data/test-volume.json');
  let rateLimiter: RateLimiter;

  beforeEach(async () => {
    // Clean up test file before each test
    try {
      await fs.unlink(testVolumeFile);
    } catch {
      // File doesn't exist, ignore
    }

    // Create rate limiter with test configuration
    rateLimiter = new RateLimiter({
      volumeFilePath: testVolumeFile,
      dailyLimit: 5,
      monthlyLimit: 20,
    });

    await rateLimiter.initialize();
  });

  afterEach(async () => {
    // Clean up test file after each test
    try {
      await fs.unlink(testVolumeFile);
    } catch {
      // Ignore if already deleted
    }
  });

  describe('initialization', () => {
    it('should initialize with empty volume data', async () => {
      const stats = await rateLimiter.getStats();

      expect(stats.daily.count).toBe(0);
      expect(stats.monthly.count).toBe(0);
      expect(stats.daily.limit).toBe(5);
      expect(stats.monthly.limit).toBe(20);
    });

    it('should create volume file on initialization', async () => {
      const fileExists = await fs
        .access(testVolumeFile)
        .then(() => true)
        .catch(() => false);

      expect(fileExists).toBe(true);
    });

    it('should load existing volume data', async () => {
      // Increment counter
      await rateLimiter.increment();

      // Create new rate limiter instance (should load existing data)
      const newRateLimiter = new RateLimiter({
        volumeFilePath: testVolumeFile,
        dailyLimit: 5,
        monthlyLimit: 20,
      });

      await newRateLimiter.initialize();
      const stats = await newRateLimiter.getStats();

      expect(stats.daily.count).toBe(1);
      expect(stats.monthly.count).toBe(1);
    });
  });

  describe('increment', () => {
    it('should increment daily and monthly counters', async () => {
      await rateLimiter.increment();

      const stats = await rateLimiter.getStats();
      expect(stats.daily.count).toBe(1);
      expect(stats.monthly.count).toBe(1);
    });

    it('should persist counters to disk', async () => {
      await rateLimiter.increment();

      // Read file directly
      const data = JSON.parse(await fs.readFile(testVolumeFile, 'utf-8'));
      expect(data.daily.count).toBe(1);
      expect(data.monthly.count).toBe(1);
    });

    it('should throw RateLimitError when daily limit exceeded', async () => {
      // Increment to daily limit
      for (let i = 0; i < 5; i++) {
        await rateLimiter.increment();
      }

      // Next increment should throw
      await expect(rateLimiter.increment()).rejects.toThrow(RateLimitError);
    });

    it('should throw RateLimitError when monthly limit exceeded', async () => {
      // Manually set monthly counter to limit
      const customRateLimiter = new RateLimiter({
        volumeFilePath: testVolumeFile,
        dailyLimit: 100, // High daily limit
        monthlyLimit: 3, // Low monthly limit
      });

      await customRateLimiter.initialize();

      // Increment to monthly limit
      for (let i = 0; i < 3; i++) {
        await customRateLimiter.increment();
      }

      // Next increment should throw
      await expect(customRateLimiter.increment()).rejects.toThrow(RateLimitError);
    });
  });

  describe('isLimitExceeded', () => {
    it('should return false when limits not exceeded', async () => {
      await rateLimiter.increment();

      const exceeded = await rateLimiter.isLimitExceeded();
      expect(exceeded).toBe(false);
    });

    it('should return true when daily limit exceeded', async () => {
      // Increment to daily limit
      for (let i = 0; i < 5; i++) {
        await rateLimiter.increment();
      }

      const exceeded = await rateLimiter.isLimitExceeded();
      expect(exceeded).toBe(true);
    });

    it('should return true when monthly limit exceeded', async () => {
      const customRateLimiter = new RateLimiter({
        volumeFilePath: testVolumeFile,
        dailyLimit: 100,
        monthlyLimit: 3,
      });

      await customRateLimiter.initialize();

      // Increment to monthly limit
      for (let i = 0; i < 3; i++) {
        await customRateLimiter.increment();
      }

      const exceeded = await customRateLimiter.isLimitExceeded();
      expect(exceeded).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return current statistics', async () => {
      await rateLimiter.increment();
      await rateLimiter.increment();

      const stats = await rateLimiter.getStats();

      expect(stats.daily.count).toBe(2);
      expect(stats.daily.limit).toBe(5);
      expect(stats.monthly.count).toBe(2);
      expect(stats.monthly.limit).toBe(20);
      expect(stats.daily.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(stats.monthly.month).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('reset', () => {
    it('should reset counters to zero', async () => {
      // Increment counters
      await rateLimiter.increment();
      await rateLimiter.increment();

      // Reset
      await rateLimiter.reset();

      // Check counters are zero
      const stats = await rateLimiter.getStats();
      expect(stats.daily.count).toBe(0);
      expect(stats.monthly.count).toBe(0);
    });

    it('should persist reset to disk', async () => {
      await rateLimiter.increment();
      await rateLimiter.reset();

      // Read file directly
      const data = JSON.parse(await fs.readFile(testVolumeFile, 'utf-8'));
      expect(data.daily.count).toBe(0);
      expect(data.monthly.count).toBe(0);
    });
  });

  describe('date rotation', () => {
    it('should rotate daily counter on date change', async () => {
      // Increment counter
      await rateLimiter.increment();

      // Manually modify volume file to simulate yesterday
      const data = JSON.parse(await fs.readFile(testVolumeFile, 'utf-8'));
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      data.daily.date = yesterday.toISOString().split('T')[0];
      await fs.writeFile(testVolumeFile, JSON.stringify(data, null, 2));

      // Create new instance (will load modified data)
      const newRateLimiter = new RateLimiter({
        volumeFilePath: testVolumeFile,
        dailyLimit: 5,
        monthlyLimit: 20,
      });

      await newRateLimiter.initialize();

      // Check stats (should have rotated daily counter)
      const stats = await newRateLimiter.getStats();
      expect(stats.daily.count).toBe(0);
      expect(stats.monthly.count).toBe(1); // Monthly should not rotate
    });

    it('should rotate monthly counter on month change', async () => {
      // Increment counter
      await rateLimiter.increment();

      // Manually modify volume file to simulate last month
      const data = JSON.parse(await fs.readFile(testVolumeFile, 'utf-8'));
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toISOString().split('T')[0].substring(0, 7);
      data.monthly.month = lastMonthStr;
      // Also update daily date to trigger daily rotation
      data.daily.date = lastMonth.toISOString().split('T')[0];
      await fs.writeFile(testVolumeFile, JSON.stringify(data, null, 2));

      // Create new instance (will load modified data)
      const newRateLimiter = new RateLimiter({
        volumeFilePath: testVolumeFile,
        dailyLimit: 5,
        monthlyLimit: 20,
      });

      await newRateLimiter.initialize();

      // Check stats (should have rotated both counters)
      const stats = await newRateLimiter.getStats();
      expect(stats.daily.count).toBe(0); // Also rotates daily
      expect(stats.monthly.count).toBe(0);
    });
  });

  describe('environment variables', () => {
    it('should use environment variable for daily limit', async () => {
      // Set environment variable
      process.env.MAX_DAILY_AUTH_ATTEMPTS = '15';

      const customRateLimiter = new RateLimiter({
        volumeFilePath: testVolumeFile,
      });

      await customRateLimiter.initialize();
      const stats = await customRateLimiter.getStats();

      expect(stats.daily.limit).toBe(15);

      // Clean up
      delete process.env.MAX_DAILY_AUTH_ATTEMPTS;
    });

    it('should use environment variable for monthly limit', async () => {
      // Set environment variable
      process.env.MAX_MONTHLY_AUTH_ATTEMPTS = '50';

      const customRateLimiter = new RateLimiter({
        volumeFilePath: testVolumeFile,
      });

      await customRateLimiter.initialize();
      const stats = await customRateLimiter.getStats();

      expect(stats.monthly.limit).toBe(50);

      // Clean up
      delete process.env.MAX_MONTHLY_AUTH_ATTEMPTS;
    });
  });
});
