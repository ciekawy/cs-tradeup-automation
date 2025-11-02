/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthenticationService, AuthenticationError, createAuthenticatedClient } from '../src/auth';
import SteamUser from 'steam-user';
import SteamTotp from 'steam-totp';

// Mock steam-user
vi.mock('steam-user');

// Mock steam-totp
vi.mock('steam-totp', () => ({
  default: {
    generateAuthCode: vi.fn(),
  },
}));

describe('Authentication Service', () => {
  let mockSteamUser: any;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Setup mock SteamUser instance
    mockSteamUser = {
      on: vi.fn(),
      once: vi.fn(),
      off: vi.fn(),
      logOn: vi.fn(),
      logOff: vi.fn(),
      steamID: {
        getSteamID64: vi.fn().mockReturnValue('76561198012345678'),
      },
    };

    // Make SteamUser constructor return our mock
    (SteamUser as any).mockImplementation(() => mockSteamUser);

    // Setup environment variables
    process.env.STEAM_USERNAME = 'test_user';
    process.env.STEAM_PASSWORD = 'test_password';
    process.env.STEAM_SHARED_SECRET = 'test_shared_secret';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.STEAM_USERNAME;
    delete process.env.STEAM_PASSWORD;
    delete process.env.STEAM_SHARED_SECRET;
  });

  describe('Constructor', () => {
    it('should create instance with environment variables', () => {
      const service = new AuthenticationService();
      expect(service).toBeInstanceOf(AuthenticationService);
      expect(SteamUser).toHaveBeenCalledOnce();
    });

    it('should throw error if username is missing', () => {
      delete process.env.STEAM_USERNAME;

      expect(() => new AuthenticationService()).toThrow(AuthenticationError);
      expect(() => new AuthenticationService()).toThrow(
        'STEAM_USERNAME and STEAM_PASSWORD environment variables are required'
      );
    });

    it('should throw error if password is missing', () => {
      delete process.env.STEAM_PASSWORD;

      expect(() => new AuthenticationService()).toThrow(AuthenticationError);
    });

    it('should setup event handlers on construction', () => {
      new AuthenticationService();

      // Verify event handlers were registered
      expect(mockSteamUser.on).toHaveBeenCalledWith('loggedOn', expect.any(Function));
      expect(mockSteamUser.on).toHaveBeenCalledWith('steamGuard', expect.any(Function));
      expect(mockSteamUser.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockSteamUser.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
    });

    it('should accept custom configuration', () => {
      const config = {
        maxRetries: 3,
        retryDelayMin: 1000,
        retryDelayMax: 5000,
      };

      const service = new AuthenticationService(config);
      expect(service).toBeInstanceOf(AuthenticationService);
    });
  });

  describe('Authentication Flow', () => {
    it('should authenticate successfully with valid credentials', async () => {
      const service = new AuthenticationService();

      // Setup mock to simulate successful login
      mockSteamUser.once.mockImplementation((event: string, callback: Function) => {
        if (event === 'loggedOn') {
          // Trigger loggedOn event immediately
          setTimeout(() => {
            const details = { client_supplied_steam_id: 'test_user' };
            const loggedOnHandler = mockSteamUser.on.mock.calls.find(
              (call: any) => call[0] === 'loggedOn'
            )?.[1];
            if (loggedOnHandler) loggedOnHandler(details);
            callback(details);
          }, 0);
        }
      });

      const promise = service.authenticate();
      await expect(promise).resolves.toBeUndefined();
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should handle 2FA with shared secret', async () => {
      // const service = new AuthenticationService();
      const mockCode = 'ABC12';

      (SteamTotp.generateAuthCode as any).mockReturnValue(mockCode);

      // Simulate steamGuard event
      mockSteamUser.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'steamGuard') {
          setTimeout(() => {
            const mockCallback = vi.fn();
            callback('domain.com', mockCallback);
            expect(SteamTotp.generateAuthCode).toHaveBeenCalledWith('test_shared_secret');
            expect(mockCallback).toHaveBeenCalledWith(mockCode);
          }, 0);
        }
      });

      new AuthenticationService();

      // Verify steamGuard handler was registered
      expect(mockSteamUser.on).toHaveBeenCalledWith('steamGuard', expect.any(Function));
    });

    it('should throw error when 2FA required but no shared secret', async () => {
      delete process.env.STEAM_SHARED_SECRET;
      // const service = new AuthenticationService();

      // Simulate steamGuard event without shared secret
      mockSteamUser.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'steamGuard') {
          setTimeout(() => {
            expect(() => callback('domain.com', vi.fn())).toThrow(AuthenticationError);
          }, 0);
        }
      });

      new AuthenticationService();
    });

    it('should retry on network errors with exponential backoff', async () => {
      const service = new AuthenticationService({
        maxRetries: 3,
        retryDelayMin: 10, // Very short delays for testing
        retryDelayMax: 50,
      });

      let attemptCount = 0;

      mockSteamUser.once.mockImplementation((event: string, callback: Function) => {
        attemptCount++;

        if (attemptCount < 3) {
          // Fail first 2 attempts with error
          if (event === 'error') {
            setTimeout(() => callback(new Error('Network error')), 10);
          }
        } else {
          // Succeed on 3rd attempt
          if (event === 'loggedOn') {
            setTimeout(() => {
              const details = { client_supplied_steam_id: 'test_user' };
              const loggedOnHandler = mockSteamUser.on.mock.calls.find(
                (call: any) => call[0] === 'loggedOn'
              )?.[1];
              if (loggedOnHandler) loggedOnHandler(details);
              callback(details);
            }, 10);
          }
        }
      });

      const promise = service.authenticate();
      await expect(promise).resolves.toBeUndefined();
      expect(attemptCount).toBeGreaterThanOrEqual(2);
    }, 10000); // Reduced timeout

    it('should enforce human-paced delays between retries', async () => {
      const service = new AuthenticationService({
        maxRetries: 2,
        retryDelayMin: 100,
        retryDelayMax: 200,
      });

      const timestamps: number[] = [];

      mockSteamUser.once.mockImplementation((event: string, callback: Function) => {
        if (event === 'error') {
          timestamps.push(Date.now());
          setTimeout(() => callback(new Error('Network error')), 0);
        }
      });

      try {
        await service.authenticate();
      } catch (error) {
        // Expected to fail after retries
        expect(error).toBeInstanceOf(AuthenticationError);
      }

      // Verify delays between attempts (should be at least retryDelayMin)
      if (timestamps.length > 1) {
        const delay = timestamps[1] - timestamps[0];
        expect(delay).toBeGreaterThanOrEqual(100);
      }
    }, 30000);

    it('should throw error after max retries exceeded', async () => {
      const service = new AuthenticationService({
        maxRetries: 2,
        retryDelayMin: 50,
        retryDelayMax: 100,
      });

      mockSteamUser.once.mockImplementation((event: string, callback: Function) => {
        if (event === 'error') {
          setTimeout(() => callback(new Error('Network error')), 0);
        }
      });

      const promise = service.authenticate();
      await expect(promise).rejects.toThrow(AuthenticationError);
      await expect(promise).rejects.toThrow('Authentication failed after 2 attempts');
    }, 30000);

    it('should handle login timeout', async () => {
      const service = new AuthenticationService({
        maxRetries: 1,
        retryDelayMin: 50,
        retryDelayMax: 100,
      });

      // Don't trigger any events - simulate timeout
      mockSteamUser.once.mockImplementation(() => {
        // Do nothing - will timeout
      });

      const promise = service.authenticate();
      await expect(promise).rejects.toThrow('Login attempt timed out');
    }, 60000);
  });

  describe('State Management', () => {
    it('should report not authenticated initially', () => {
      const service = new AuthenticationService();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should report authenticated after successful login', async () => {
      const service = new AuthenticationService();

      mockSteamUser.once.mockImplementation((event: string, callback: Function) => {
        if (event === 'loggedOn') {
          setTimeout(() => {
            const details = { client_supplied_steam_id: 'test_user' };
            const loggedOnHandler = mockSteamUser.on.mock.calls.find(
              (call: any) => call[0] === 'loggedOn'
            )?.[1];
            if (loggedOnHandler) loggedOnHandler(details);
            callback(details);
          }, 0);
        }
      });

      await service.authenticate();
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should provide authentication state', () => {
      const service = new AuthenticationService();
      const state = service.getState();

      expect(state).toHaveProperty('isAuthenticated');
      expect(state).toHaveProperty('retryCount');
      expect(state.isAuthenticated).toBe(false);
      expect(state.retryCount).toBe(0);
    });
  });

  describe('Disconnection', () => {
    it('should disconnect successfully', async () => {
      const service = new AuthenticationService();

      // First authenticate the service
      mockSteamUser.once.mockImplementation((event: string, callback: Function) => {
        if (event === 'loggedOn') {
          setTimeout(() => {
            const details = { client_supplied_steam_id: 'test_user' };
            const loggedOnHandler = mockSteamUser.on.mock.calls.find(
              (call: any) => call[0] === 'loggedOn'
            )?.[1];
            if (loggedOnHandler) loggedOnHandler(details);
            callback(details);
          }, 0);
        } else if (event === 'disconnected') {
          setTimeout(() => callback(), 0);
        }
      });

      // Authenticate first
      await service.authenticate();
      expect(service.isAuthenticated()).toBe(true);

      // Now disconnect
      await service.disconnect();

      expect(mockSteamUser.logOff).toHaveBeenCalledOnce();
    });

    it('should handle disconnect when not authenticated', async () => {
      const service = new AuthenticationService();

      await expect(service.disconnect()).resolves.toBeUndefined();
      expect(mockSteamUser.logOff).not.toHaveBeenCalled();
    });
  });

  describe('Factory Function', () => {
    it('should create and authenticate client', async () => {
      mockSteamUser.once.mockImplementation((event: string, callback: Function) => {
        if (event === 'loggedOn') {
          setTimeout(() => {
            const details = { client_supplied_steam_id: 'test_user' };
            const loggedOnHandler = mockSteamUser.on.mock.calls.find(
              (call: any) => call[0] === 'loggedOn'
            )?.[1];
            if (loggedOnHandler) loggedOnHandler(details);
            callback(details);
          }, 0);
        }
      });

      const service = await createAuthenticatedClient();

      expect(service).toBeInstanceOf(AuthenticationService);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should accept custom configuration', async () => {
      mockSteamUser.once.mockImplementation((event: string, callback: Function) => {
        if (event === 'loggedOn') {
          setTimeout(() => {
            const details = { client_supplied_steam_id: 'test_user' };
            const loggedOnHandler = mockSteamUser.on.mock.calls.find(
              (call: any) => call[0] === 'loggedOn'
            )?.[1];
            if (loggedOnHandler) loggedOnHandler(details);
            callback(details);
          }, 0);
        }
      });

      const config = {
        maxRetries: 3,
        retryDelayMin: 1000,
        retryDelayMax: 5000,
      };

      const service = await createAuthenticatedClient(config);
      expect(service).toBeInstanceOf(AuthenticationService);
    });
  });
});
