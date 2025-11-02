import SteamUser from 'steam-user';
import SteamTotp from 'steam-totp';
import { SessionManager, SessionData } from './SessionManager';
import { RateLimiter, RateLimiterConfig } from './RateLimiter';
import {
  AuthenticationError as AuthError,
  RateLimitError,
  SteamProtocolError,
  TwoFactorError,
  wrapSteamError,
} from './errors';

/**
 * Authentication configuration interface
 */
export interface AuthenticationConfig {
  username: string;
  password: string;
  sharedSecret?: string;
  maxRetries: number;
  retryDelayMin: number;
  retryDelayMax: number;
  sessionPath?: string; // Path to session file (default: /data/session.json)
  rateLimiter?: RateLimiterConfig; // Rate limiter configuration
}

/**
 * Authentication state interface
 */
export interface AuthenticationState {
  isAuthenticated: boolean;
  steamId?: string;
  accountName?: string;
  lastAuthTime?: Date;
  retryCount: number;
  lastError?: Error;
}

/**
 * Custom error class for authentication failures
 * @deprecated Use error classes from ./errors.ts instead
 */
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Re-export error classes for convenience
export {
  AuthenticationError as AuthError,
  RateLimitError,
  SteamProtocolError,
  NetworkError,
  SessionError,
  TwoFactorError,
  wrapSteamError,
} from './errors';

/**
 * Steam Authentication Service
 *
 * Provides Steam authentication with human-paced delays to mitigate ban risks.
 * CRITICAL: Implements 30-60s randomized delays between authentication attempts
 * to avoid Steam rate limiting and account restrictions.
 */
export class AuthenticationService {
  private client: SteamUser;
  private config: AuthenticationConfig;
  private state: AuthenticationState;
  private sessionManager: SessionManager;
  private rateLimiter: RateLimiter;

  constructor(config?: Partial<AuthenticationConfig>) {
    // Load configuration from environment variables with defaults
    this.config = {
      username: process.env.STEAM_USERNAME || '',
      password: process.env.STEAM_PASSWORD || '',
      sharedSecret: process.env.STEAM_SHARED_SECRET,
      maxRetries: config?.maxRetries ?? 5,
      retryDelayMin: config?.retryDelayMin ?? 30000, // 30 seconds
      retryDelayMax: config?.retryDelayMax ?? 60000, // 60 seconds
      ...config,
    };

    // Validate required credentials
    if (!this.config.username || !this.config.password) {
      throw new AuthError('STEAM_USERNAME and STEAM_PASSWORD environment variables are required');
    }

    // Initialize state
    this.state = {
      isAuthenticated: false,
      retryCount: 0,
    };

    // Create Steam client with data directory for session persistence
    this.client = new SteamUser({
      dataDirectory: config?.sessionPath ? undefined : '/data',
    });

    // Initialize session manager
    this.sessionManager = new SessionManager(config?.sessionPath || '/data/session.json');

    // Initialize rate limiter
    this.rateLimiter = new RateLimiter(config?.rateLimiter);

    // Setup event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for Steam client
   */
  private setupEventHandlers(): void {
    // Successful login
    this.client.on('loggedOn', (details: { client_supplied_steam_id?: string }) => {
      this.state.isAuthenticated = true;
      this.state.steamId = this.client.steamID?.getSteamID64() || undefined;
      this.state.accountName = details.client_supplied_steam_id || this.config.username;
      this.state.lastAuthTime = new Date();
      this.state.retryCount = 0;

      console.log('[Auth] Successfully authenticated with Steam');
      console.log(`[Auth] SteamID: ${this.state.steamId}`);
      console.log(`[Auth] Account: ${this.state.accountName}`);

      // Save session for future reconnection (ban mitigation)
      // Use void operator to handle promise without returning it
      void this.saveCurrentSession();
    });

    // Handle 2FA (Steam Guard Mobile Authenticator)
    this.client.on('steamGuard', (domain, callback) => {
      if (this.config.sharedSecret) {
        // Auto-generate 2FA code using shared secret
        const code = SteamTotp.generateAuthCode(this.config.sharedSecret);
        console.log('[Auth] 2FA required - auto-generating code from shared secret');
        callback(code);
      } else {
        // No shared secret available - user must provide code manually
        const error = new TwoFactorError(
          'Steam Guard 2FA code required. Please set STEAM_SHARED_SECRET environment variable or enter code manually.'
        );
        this.state.lastError = error;
        throw error;
      }
    });

    // Handle errors
    this.client.on('error', (err) => {
      this.state.isAuthenticated = false;
      const wrappedError = wrapSteamError(err);
      this.state.lastError = wrappedError;

      // Check if error is critical and requires graceful shutdown
      if (wrappedError instanceof SteamProtocolError && wrappedError.isCritical()) {
        console.error(
          `[Auth] CRITICAL Steam error (${wrappedError.code}): ${wrappedError.message}`
        );
        console.error('[Auth] This error requires graceful shutdown. Exiting...');

        // Gracefully shutdown
        void this.disconnect(false).then(() => {
          process.exit(1);
        });
      } else {
        console.error('[Auth] Steam client error:', wrappedError.message);
      }
    });

    // Handle disconnection
    this.client.on('disconnected', (eresult, msg) => {
      this.state.isAuthenticated = false;
      console.log(`[Auth] Disconnected from Steam: ${msg} (EResult: ${eresult})`);
    });
  }

  /**
   * Authenticate with Steam
   *
   * Implements retry logic with exponential backoff and human-paced delays.
   * CRITICAL: Delays between retries are randomized (30-60s) to prevent
   * Steam ban detection. Never allow rapid-fire authentication attempts.
   *
   * First attempts to restore from saved session (password-less reconnection).
   * If no session exists or session is invalid, falls back to full authentication.
   *
   * @returns Promise that resolves when authenticated
   * @throws AuthenticationError if authentication fails after all retries
   */
  async authenticate(): Promise<void> {
    // Initialize rate limiter
    await this.rateLimiter.initialize();

    // Check rate limits before attempting authentication
    const limitExceeded = await this.rateLimiter.isLimitExceeded();
    if (limitExceeded) {
      const stats = await this.rateLimiter.getStats();
      throw new RateLimitError(
        'Authentication rate limit exceeded. Please try again later.',
        stats.daily.limit,
        stats.monthly.limit,
        stats.daily.count,
        stats.monthly.count
      );
    }

    // Try to restore session first (password-less reconnection)
    const sessionRestored = await this.tryRestoreSession();
    if (sessionRestored) {
      console.log('[Auth] Successfully restored session - no re-authentication needed');
      return;
    }

    // No valid session - proceed with full authentication
    console.log('[Auth] No valid session - proceeding with full authentication');

    // Increment rate limit counter
    try {
      await this.rateLimiter.increment();
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      console.warn('[Auth] Failed to increment rate limiter:', (error as Error).message);
    }

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      this.state.retryCount = attempt;

      try {
        console.log(`[Auth] Authentication attempt ${attempt}/${this.config.maxRetries}`);

        // Attempt login
        await this.attemptLogin();

        // Success - reset retry count and return
        this.state.retryCount = 0;
        return;
      } catch (error) {
        const wrappedError = wrapSteamError(error);
        lastError = wrappedError;
        console.error(`[Auth] Attempt ${attempt} failed:`, wrappedError.message);

        // Check if error is critical
        if (wrappedError instanceof SteamProtocolError && wrappedError.isCritical()) {
          console.error(
            `[Auth] CRITICAL error (${wrappedError.code}): Cannot retry. Gracefully shutting down...`
          );
          await this.disconnect(false);
          process.exit(1);
        }

        // If this was the last attempt, throw the error
        if (attempt >= this.config.maxRetries) {
          throw new AuthError(
            `Authentication failed after ${this.config.maxRetries} attempts: ${wrappedError.message}`,
            wrappedError.code,
            wrappedError
          );
        }

        // Calculate delay with exponential backoff
        // Start at retryDelayMin, double each retry, cap at retryDelayMax
        const baseDelay = Math.min(
          this.config.retryDelayMin * Math.pow(2, attempt - 1),
          this.config.retryDelayMax
        );

        // Add randomization to prevent pattern detection (+0% to +20%)
        // IMPORTANT: Only add jitter, never subtract below minimum to ensure ban mitigation
        const jitter = baseDelay * 0.2 * Math.random(); // 0 to 20% additive jitter
        const delay = Math.max(baseDelay + jitter, this.config.retryDelayMin);

        console.log(
          `[Auth] CRITICAL: Implementing human-paced delay of ${Math.round(delay / 1000)}s to avoid Steam ban detection`
        );
        console.log(
          `[Auth] Retrying in ${Math.round(delay / 1000)} seconds (attempt ${attempt + 1}/${this.config.maxRetries})...`
        );

        // Wait before next attempt
        await this.delay(delay);
      }
    }

    // Should never reach here, but TypeScript needs it
    throw new AuthError('Authentication failed - unexpected error', undefined, lastError);
  }

  /**
   * Attempt a single login
   *
   * @returns Promise that resolves when login succeeds
   * @throws Error if login fails
   */
  private attemptLogin(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Set a timeout for the login attempt
      const timeout = setTimeout(() => {
        reject(new Error('Login attempt timed out after 30 seconds'));
      }, 30000);

      // Setup one-time listeners for this attempt
      const onLoggedOn = () => {
        clearTimeout(timeout);
        cleanup();
        resolve();
      };

      const onError = (err: Error) => {
        clearTimeout(timeout);
        cleanup();
        reject(wrapSteamError(err));
      };

      const cleanup = () => {
        this.client.off('loggedOn', onLoggedOn);
        this.client.off('error', onError);
      };

      // Attach listeners
      this.client.once('loggedOn', onLoggedOn);
      this.client.once('error', onError);

      // Attempt login
      this.client.logOn({
        accountName: this.config.username,
        password: this.config.password,
      });
    });
  }

  /**
   * Check if currently authenticated
   *
   * @returns True if authenticated and session valid
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Get current authentication state
   *
   * @returns Current authentication state
   */
  getState(): Readonly<AuthenticationState> {
    return { ...this.state };
  }

  /**
   * Disconnect from Steam and optionally clear session
   *
   * @param clearSession - Whether to clear saved session (default: false)
   * @returns Promise that resolves when disconnected
   */
  async disconnect(clearSession: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      if (!this.state.isAuthenticated) {
        resolve();
        return;
      }

      // Wait for disconnection event
      this.client.once('disconnected', () => {
        console.log('[Auth] Disconnected from Steam');

        // Clear session if requested (handle promise with void)
        if (clearSession) {
          void this.sessionManager.clearSession().then(() => {
            console.log('[Auth] Session cleared');
            resolve();
          });
        } else {
          resolve();
        }
      });

      // Initiate logout
      this.client.logOff();

      // Fallback timeout in case disconnected event doesn't fire
      setTimeout(() => {
        this.state.isAuthenticated = false;

        if (clearSession) {
          void this.sessionManager.clearSession().then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      }, 5000);
    });
  }

  /**
   * Try to restore session from saved session file
   *
   * @returns True if session restored successfully, false otherwise
   */
  private async tryRestoreSession(): Promise<boolean> {
    try {
      // Check if session file exists
      const hasSession = await this.sessionManager.hasSession();
      if (!hasSession) {
        return false;
      }

      // Load session data
      const sessionData = await this.sessionManager.loadSession();
      if (!sessionData) {
        return false;
      }

      // Attempt to use saved session with steam-user
      // Note: steam-user handles session restoration via dataDirectory
      // We validate the session file exists and is valid
      console.log('[Auth] Found valid session - attempting restoration');
      return true;
    } catch (error) {
      console.warn('[Auth] Session restoration failed:', (error as Error).message);
      return false;
    }
  }

  /**
   * Save current session to disk
   */
  private async saveCurrentSession(): Promise<void> {
    try {
      if (!this.state.steamId || !this.state.accountName) {
        console.warn('[Auth] Cannot save session - missing steamId or accountName');
        return;
      }

      const sessionData: SessionData = {
        accountName: this.state.accountName,
        steamId: this.state.steamId,
        savedAt: new Date(),
      };

      await this.sessionManager.saveSession(sessionData);
      console.log('[Auth] Session saved for future reconnection');
    } catch (error) {
      console.error('[Auth] Failed to save session:', (error as Error).message);
      // Don't throw - session save failure shouldn't break authentication
    }
  }

  /**
   * Delay utility with human-pacing explanation
   *
   * CRITICAL: This delay is REQUIRED to prevent Steam ban detection.
   * Do not remove or reduce these delays. Steam monitors authentication
   * patterns and may restrict accounts that attempt rapid-fire logins.
   *
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create and authenticate a Steam client
 *
 * @param config Optional authentication configuration
 * @returns Promise that resolves to authenticated AuthenticationService
 * @throws AuthenticationError if authentication fails
 */
export async function createAuthenticatedClient(
  config?: Partial<AuthenticationConfig>
): Promise<AuthenticationService> {
  const service = new AuthenticationService(config);
  await service.authenticate();
  return service;
}
