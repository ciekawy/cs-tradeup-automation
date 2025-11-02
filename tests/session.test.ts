import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { SessionManager, SessionData, SessionManagerError } from '../src/auth/SessionManager';
import path from 'path';

describe('SessionManager', () => {
  const testDataDir = '/tmp/test-sessions';
  const testSessionPath = path.join(testDataDir, 'test-session.json');
  let sessionManager: SessionManager;

  beforeEach(async () => {
    // Clean up test directory before each test
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch {
      // Directory might not exist - that's fine
    }

    sessionManager = new SessionManager(testSessionPath);
  });

  afterEach(async () => {
    // Clean up test directory after each test
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch {
      // Directory might not exist - that's fine
    }
  });

  describe('saveSession', () => {
    it('should save session data to disk', async () => {
      const sessionData: SessionData = {
        accountName: 'testuser',
        steamId: '76561198012345678',
        savedAt: new Date(),
      };

      await sessionManager.saveSession(sessionData);

      // Verify file exists
      const fileContent = await fs.readFile(testSessionPath, 'utf8');
      const savedData = JSON.parse(fileContent) as SessionData;

      expect(savedData.accountName).toBe('testuser');
      expect(savedData.steamId).toBe('76561198012345678');
      expect(savedData.savedAt).toBeDefined();
    });

    it('should create data directory if it does not exist', async () => {
      const sessionData: SessionData = {
        accountName: 'testuser',
        steamId: '76561198012345678',
        savedAt: new Date(),
      };

      await sessionManager.saveSession(sessionData);

      // Verify directory was created
      const stats = await fs.stat(testDataDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should save session with optional fields', async () => {
      const sessionData: SessionData = {
        accountName: 'testuser',
        steamId: '76561198012345678',
        refreshToken: 'test-refresh-token',
        accessToken: 'test-access-token',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        savedAt: new Date(),
      };

      await sessionManager.saveSession(sessionData);

      const fileContent = await fs.readFile(testSessionPath, 'utf8');
      const savedData = JSON.parse(fileContent) as SessionData;

      expect(savedData.refreshToken).toBe('test-refresh-token');
      expect(savedData.accessToken).toBe('test-access-token');
      expect(savedData.expiresAt).toBeDefined();
    });

    it('should throw SessionManagerError if write fails', async () => {
      // Create a read-only directory to force write failure
      const readOnlyDir = '/tmp/readonly-test';
      const readOnlySessionPath = path.join(readOnlyDir, 'session.json');
      const readOnlyManager = new SessionManager(readOnlySessionPath);

      try {
        await fs.mkdir(readOnlyDir, { mode: 0o444 }); // Read-only directory

        const sessionData: SessionData = {
          accountName: 'testuser',
          steamId: '76561198012345678',
          savedAt: new Date(),
        };

        await expect(readOnlyManager.saveSession(sessionData)).rejects.toThrow(SessionManagerError);
      } finally {
        // Clean up (change permissions back to allow deletion)
        try {
          await fs.chmod(readOnlyDir, 0o755);
          await fs.rm(readOnlyDir, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
      }
    });
  });

  describe('loadSession', () => {
    it('should load valid session data from disk', async () => {
      const sessionData: SessionData = {
        accountName: 'testuser',
        steamId: '76561198012345678',
        savedAt: new Date(),
      };

      await sessionManager.saveSession(sessionData);
      const loadedSession = await sessionManager.loadSession();

      expect(loadedSession).not.toBeNull();
      expect(loadedSession?.accountName).toBe('testuser');
      expect(loadedSession?.steamId).toBe('76561198012345678');
    });

    it('should return null if session file does not exist', async () => {
      const loadedSession = await sessionManager.loadSession();
      expect(loadedSession).toBeNull();
    });

    it('should return null and clear session if data is invalid', async () => {
      // Write invalid JSON to session file
      await fs.mkdir(testDataDir, { recursive: true });
      await fs.writeFile(testSessionPath, '{ invalid json }', 'utf8');

      const loadedSession = await sessionManager.loadSession();
      expect(loadedSession).toBeNull();

      // Verify session was cleared
      const hasSession = await sessionManager.hasSession();
      expect(hasSession).toBe(false);
    });

    it('should return null and clear session if structure is invalid', async () => {
      // Write valid JSON but invalid structure
      await fs.mkdir(testDataDir, { recursive: true });
      await fs.writeFile(testSessionPath, JSON.stringify({ invalid: 'data' }), 'utf8');

      const loadedSession = await sessionManager.loadSession();
      expect(loadedSession).toBeNull();
    });

    it('should return null and clear session if session is expired', async () => {
      const expiredSession: SessionData = {
        accountName: 'testuser',
        steamId: '76561198012345678',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        savedAt: new Date(),
      };

      await sessionManager.saveSession(expiredSession);
      const loadedSession = await sessionManager.loadSession();

      expect(loadedSession).toBeNull();
    });

    it('should load session if not expired', async () => {
      const validSession: SessionData = {
        accountName: 'testuser',
        steamId: '76561198012345678',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        savedAt: new Date(),
      };

      await sessionManager.saveSession(validSession);
      const loadedSession = await sessionManager.loadSession();

      expect(loadedSession).not.toBeNull();
      expect(loadedSession?.accountName).toBe('testuser');
    });
  });

  describe('clearSession', () => {
    it('should delete session file', async () => {
      const sessionData: SessionData = {
        accountName: 'testuser',
        steamId: '76561198012345678',
        savedAt: new Date(),
      };

      await sessionManager.saveSession(sessionData);
      expect(await sessionManager.hasSession()).toBe(true);

      await sessionManager.clearSession();
      expect(await sessionManager.hasSession()).toBe(false);
    });

    it('should not throw error if session file does not exist', async () => {
      await expect(sessionManager.clearSession()).resolves.not.toThrow();
    });
  });

  describe('hasSession', () => {
    it('should return true if session file exists', async () => {
      const sessionData: SessionData = {
        accountName: 'testuser',
        steamId: '76561198012345678',
        savedAt: new Date(),
      };

      await sessionManager.saveSession(sessionData);
      expect(await sessionManager.hasSession()).toBe(true);
    });

    it('should return false if session file does not exist', async () => {
      expect(await sessionManager.hasSession()).toBe(false);
    });
  });

  describe('getSessionPath', () => {
    it('should return the configured session path', () => {
      expect(sessionManager.getSessionPath()).toBe(testSessionPath);
    });
  });

  describe('file permissions', () => {
    it('should save session file with 600 permissions', async () => {
      const sessionData: SessionData = {
        accountName: 'testuser',
        steamId: '76561198012345678',
        savedAt: new Date(),
      };

      await sessionManager.saveSession(sessionData);

      // Verify file permissions
      const stats = await fs.stat(testSessionPath);
      const mode = stats.mode & 0o777;

      // Should be 600 (read/write for owner only)
      expect(mode).toBe(0o600);
    });
  });
});
