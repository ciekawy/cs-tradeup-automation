import { promises as fs } from 'fs';
import { constants as fsConstants } from 'fs';
import path from 'path';

/**
 * Session data interface
 */
export interface SessionData {
  accountName: string;
  steamId: string;
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: Date;
  savedAt: Date;
}

/**
 * Session manager error class
 */
export class SessionManagerError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'SessionManagerError';
  }
}

/**
 * SessionManager - Handles Steam session token persistence
 *
 * CRITICAL: Session persistence reduces authentication frequency, which is
 * essential for Steam ban mitigation. By reusing valid sessions, we minimize
 * repeated login attempts that could trigger fraud detection.
 *
 * Security: Session files are stored with 600 permissions (read/write for owner only)
 * to protect sensitive tokens from unauthorized access.
 */
export class SessionManager {
  private readonly sessionPath: string;
  private readonly dataDir: string;

  constructor(sessionPath: string = '/data/session.json') {
    this.sessionPath = sessionPath;
    this.dataDir = path.dirname(sessionPath);
  }

  /**
   * Save session data to disk
   *
   * @param sessionData - Session data to persist
   * @throws SessionManagerError if save fails
   */
  async saveSession(sessionData: SessionData): Promise<void> {
    try {
      // Ensure data directory exists
      await this.ensureDataDirectory();

      // Prepare session data with current timestamp
      const dataToSave = {
        ...sessionData,
        savedAt: new Date(),
      };

      // Write session file
      await fs.writeFile(this.sessionPath, JSON.stringify(dataToSave, null, 2), {
        encoding: 'utf8',
        mode: 0o600, // Read/write for owner only
      });

      console.log(`[SessionManager] Session saved to ${this.sessionPath}`);
      console.log(`[SessionManager] SteamID: ${sessionData.steamId}`);
      console.log(`[SessionManager] Account: ${sessionData.accountName}`);
    } catch (error) {
      throw new SessionManagerError(
        `Failed to save session to ${this.sessionPath}`,
        error as Error
      );
    }
  }

  /**
   * Load session data from disk
   *
   * @returns Session data if valid, null if no session or invalid
   */
  async loadSession(): Promise<SessionData | null> {
    try {
      // Check if session file exists
      await fs.access(this.sessionPath, fsConstants.R_OK);

      // Read session file
      const fileContent = await fs.readFile(this.sessionPath, 'utf8');

      let sessionData: SessionData;
      try {
        sessionData = JSON.parse(fileContent) as SessionData;
      } catch (parseError) {
        console.warn('[SessionManager] Invalid JSON in session file - clearing session');
        await this.clearSession();
        return null;
      }

      // Validate session data structure
      if (!this.isValidSessionData(sessionData)) {
        console.warn('[SessionManager] Invalid session data structure - clearing session');
        await this.clearSession();
        return null;
      }

      // Check if session is expired
      if (sessionData.expiresAt) {
        const expiresAt = new Date(sessionData.expiresAt);
        if (expiresAt < new Date()) {
          console.log('[SessionManager] Session expired - clearing session');
          await this.clearSession();
          return null;
        }
      }

      console.log(`[SessionManager] Session loaded from ${this.sessionPath}`);
      console.log(`[SessionManager] SteamID: ${sessionData.steamId}`);
      console.log(`[SessionManager] Account: ${sessionData.accountName}`);
      console.log(`[SessionManager] Saved: ${new Date(sessionData.savedAt).toISOString()}`);

      return sessionData;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('[SessionManager] No saved session found');
        return null;
      }

      console.warn('[SessionManager] Failed to load session:', (error as Error).message);
      return null;
    }
  }

  /**
   * Clear session data from disk
   *
   * @throws SessionManagerError if clear fails
   */
  async clearSession(): Promise<void> {
    try {
      await fs.unlink(this.sessionPath);
      console.log(`[SessionManager] Session cleared from ${this.sessionPath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist - that's fine
        return;
      }

      throw new SessionManagerError(
        `Failed to clear session from ${this.sessionPath}`,
        error as Error
      );
    }
  }

  /**
   * Check if session exists on disk
   *
   * @returns True if session file exists
   */
  async hasSession(): Promise<boolean> {
    try {
      await fs.access(this.sessionPath, fsConstants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get session file path
   *
   * @returns Full path to session file
   */
  getSessionPath(): string {
    return this.sessionPath;
  }

  /**
   * Ensure data directory exists with proper permissions
   */
  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true, mode: 0o700 });
    } catch (error) {
      // Directory might already exist - check if we can write to it
      try {
        await fs.access(this.dataDir, fsConstants.W_OK);
      } catch {
        throw new SessionManagerError(
          `Data directory ${this.dataDir} is not writable`,
          error as Error
        );
      }
    }
  }

  /**
   * Validate session data structure
   *
   * @param data - Data to validate
   * @returns True if data is valid SessionData
   */
  private isValidSessionData(data: unknown): data is SessionData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const session = data as Record<string, unknown>;

    return (
      typeof session.accountName === 'string' &&
      typeof session.steamId === 'string' &&
      (session.savedAt instanceof Date ||
        typeof session.savedAt === 'string' ||
        typeof session.savedAt === 'number')
    );
  }
}
