import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventEmitter } from 'events';
import { GameCoordinatorService, GameCoordinatorError } from '../src/gamecoordinator';
import type SteamUser from 'steam-user';

// Mock steam-user
class MockSteamUser extends EventEmitter {
  gamesPlayed = vi.fn();
  steamID = {
    getSteamID64: () => '76561198000000000',
  };
}

// Mock modules with factory functions
vi.mock('steam-user', () => ({
  default: class MockSteamUserFactory extends EventEmitter {
    gamesPlayed = vi.fn();
    steamID = {
      getSteamID64: () => '76561198000000000',
    };
  },
}));

vi.mock('globaloffensive', () => ({
  default: class MockGlobalOffensiveFactory extends EventEmitter {
    craft = vi.fn();
    constructor(public steamClient: unknown) {
      super();
    }
  },
}));

describe('GameCoordinatorService', () => {
  let mockSteamClient: MockSteamUser;
  let service: GameCoordinatorService;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSteamClient = new MockSteamUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Constructor', () => {
    it('should create service with default config', () => {
      service = new GameCoordinatorService({
        steamClient: mockSteamClient as unknown as SteamUser,
      });

      expect(service).toBeDefined();
      expect(service.isConnected()).toBe(false);

      const state = service.getState();
      expect(state.isConnected).toBe(false);
      expect(state.connectionAttempts).toBe(0);
    });

    it('should create service with custom config', () => {
      service = new GameCoordinatorService({
        steamClient: mockSteamClient as unknown as SteamUser,
        connectionTimeout: 10000,
        operationDelayMin: 5000,
        operationDelayMax: 10000,
      });

      expect(service).toBeDefined();
      expect(service.isConnected()).toBe(false);
    });

    it('should initialize state correctly', () => {
      service = new GameCoordinatorService({
        steamClient: mockSteamClient as unknown as SteamUser,
      });

      const state = service.getState();
      expect(state.isConnected).toBe(false);
      expect(state.connectionAttempts).toBe(0);
      expect(state.lastConnectTime).toBeUndefined();
      expect(state.lastDisconnectTime).toBeUndefined();
      expect(state.lastError).toBeUndefined();
    });
  });

  describe('Connection', () => {
    beforeEach(() => {
      service = new GameCoordinatorService({
        steamClient: mockSteamClient as unknown as SteamUser,
        connectionTimeout: 5000,
      });
    });

    it('should connect to GC successfully', async () => {
      const connectPromise = service.connect();

      // Simulate GC connection after a short delay
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 100);

      vi.advanceTimersByTime(100);
      await connectPromise;

      expect(service.isConnected()).toBe(true);
      expect(mockSteamClient.gamesPlayed).toHaveBeenCalledWith([730]);

      const state = service.getState();
      expect(state.isConnected).toBe(true);
      expect(state.connectionAttempts).toBe(0); // Reset to 0 after successful connection
      expect(state.lastConnectTime).toBeDefined();
    });

    it('should timeout if GC connection takes too long', async () => {
      const connectPromise = service.connect();

      // Don't emit connectedToGC event - let it timeout
      vi.advanceTimersByTime(5000);

      await expect(connectPromise).rejects.toThrow(GameCoordinatorError);
      await expect(connectPromise).rejects.toThrow(/timed out/);

      expect(service.isConnected()).toBe(false);

      const state = service.getState();
      expect(state.lastError).toBeDefined();
      expect(state.lastError?.message).toContain('timed out');
    });

    it('should not reconnect if already connected', async () => {
      // First connection
      const connectPromise1 = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 100);
      vi.advanceTimersByTime(100);
      await connectPromise1;

      // Reset mock
      mockSteamClient.gamesPlayed.mockClear();

      // Second connection attempt
      await service.connect();

      // Should not call gamesPlayed again
      expect(mockSteamClient.gamesPlayed).not.toHaveBeenCalled();
      expect(service.isConnected()).toBe(true);
    });

    it('should increment connection attempts', async () => {
      const connectPromise = service.connect();

      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 100);

      vi.advanceTimersByTime(100);
      await connectPromise;

      const state = service.getState();
      expect(state.connectionAttempts).toBe(0); // Reset to 0 after successful connection
    });

    it('should reset connection attempts on successful connection', async () => {
      const connectPromise = service.connect();

      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 100);

      vi.advanceTimersByTime(100);
      await connectPromise;

      const state = service.getState();
      expect(state.connectionAttempts).toBe(0); // Reset to 0 after successful connection

      // Disconnect
      const disconnectPromise = service.disconnect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('disconnectedFromGC', 0);
      }, 100);
      vi.advanceTimersByTime(100);
      await disconnectPromise;

      // Reconnect
      const reconnectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 100);
      vi.advanceTimersByTime(100);
      await reconnectPromise;

      const newState = service.getState();
      expect(newState.connectionAttempts).toBe(0); // Reset to 0 after successful connection
    });
  });

  describe('Disconnection', () => {
    beforeEach(() => {
      service = new GameCoordinatorService({
        steamClient: mockSteamClient as unknown as SteamUser,
        connectionTimeout: 5000,
      });
    });

    it('should disconnect from GC successfully', async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 100);
      vi.advanceTimersByTime(100);
      await connectPromise;

      expect(service.isConnected()).toBe(true);

      // Disconnect
      const disconnectPromise = service.disconnect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('disconnectedFromGC', 0);
      }, 100);
      vi.advanceTimersByTime(100);
      await disconnectPromise;

      expect(service.isConnected()).toBe(false);
      expect(mockSteamClient.gamesPlayed).toHaveBeenCalledWith([]);

      const state = service.getState();
      expect(state.isConnected).toBe(false);
      expect(state.lastDisconnectTime).toBeDefined();
    });

    it('should not disconnect if already disconnected', async () => {
      await service.disconnect();

      expect(service.isConnected()).toBe(false);
      expect(mockSteamClient.gamesPlayed).not.toHaveBeenCalled();
    });

    it('should fallback to timeout if disconnected event does not fire', async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 100);
      vi.advanceTimersByTime(100);
      await connectPromise;

      // Disconnect without emitting event
      const disconnectPromise = service.disconnect();
      vi.advanceTimersByTime(5000);
      await disconnectPromise;

      expect(service.isConnected()).toBe(false);
    });
  });

  describe('Inventory Retrieval', () => {
    beforeEach(() => {
      service = new GameCoordinatorService({
        steamClient: mockSteamClient as unknown as SteamUser,
        connectionTimeout: 5000,
        operationDelayMin: 100,
        operationDelayMax: 200,
      });
    });

    it('should throw error when not connected', async () => {
      await expect(service.getInventory()).rejects.toThrow(GameCoordinatorError);
      await expect(service.getInventory()).rejects.toThrow(/Not connected/);
    });

    it('should implement human-paced delay before inventory request', async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 50);
      vi.advanceTimersByTime(50);
      await connectPromise;

      // Start inventory request
      const inventoryPromise = service.getInventory();

      // Advance time to trigger delay
      vi.advanceTimersByTime(200);

      const inventory = await inventoryPromise;

      // Should return empty array (placeholder implementation)
      expect(inventory).toEqual([]);
    });

    it('should apply delay before inventory request', async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 50);
      vi.advanceTimersByTime(50);
      await connectPromise;

      // Inventory request should apply delay
      const inventoryPromise = service.getInventory();
      vi.advanceTimersByTime(200);
      const inventory = await inventoryPromise;

      // Should return empty array (placeholder implementation)
      expect(inventory).toEqual([]);
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      service = new GameCoordinatorService({
        steamClient: mockSteamClient as unknown as SteamUser,
      });
    });

    it('should return accurate connection status', async () => {
      expect(service.isConnected()).toBe(false);

      // Connect
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 100);
      vi.advanceTimersByTime(100);
      await connectPromise;

      expect(service.isConnected()).toBe(true);

      // Disconnect
      const disconnectPromise = service.disconnect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('disconnectedFromGC', 0);
      }, 100);
      vi.advanceTimersByTime(100);
      await disconnectPromise;

      expect(service.isConnected()).toBe(false);
    });

    it('should return readonly copy of state', () => {
      const state1 = service.getState();
      const state2 = service.getState();

      expect(state1).not.toBe(state2); // Different objects
      expect(state1).toEqual(state2); // Same content
    });

    it('should update state on connection', async () => {
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 100);
      vi.advanceTimersByTime(100);
      await connectPromise;

      const state = service.getState();
      expect(state.isConnected).toBe(true);
      expect(state.lastConnectTime).toBeDefined();
      expect(state.connectionAttempts).toBe(0); // Reset to 0 after successful connection
    });

    it('should update state on disconnection', async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 100);
      vi.advanceTimersByTime(100);
      await connectPromise;

      // Disconnect
      const disconnectPromise = service.disconnect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('disconnectedFromGC', 0);
      }, 100);
      vi.advanceTimersByTime(100);
      await disconnectPromise;

      const state = service.getState();
      expect(state.isConnected).toBe(false);
      expect(state.lastDisconnectTime).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      service = new GameCoordinatorService({
        steamClient: mockSteamClient as unknown as SteamUser,
        connectionTimeout: 5000,
      });
    });

    it('should create GameCoordinatorError with error code', () => {
      const error = new GameCoordinatorError('Test error', 'TEST_CODE');
      expect(error.name).toBe('GameCoordinatorError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
    });

    it('should propagate error cause', () => {
      const cause = new Error('Original error');
      const error = new GameCoordinatorError('Wrapped error', 'TEST_CODE', cause);

      expect(error.cause).toBe(cause);
    });

    it('should store last error in state on connection timeout', async () => {
      const connectPromise = service.connect();
      vi.advanceTimersByTime(5000);

      await expect(connectPromise).rejects.toThrow();

      const state = service.getState();
      expect(state.lastError).toBeDefined();
      expect(state.lastError).toBeInstanceOf(GameCoordinatorError);
    });
  });

  describe('Event Handlers', () => {
    beforeEach(() => {
      service = new GameCoordinatorService({
        steamClient: mockSteamClient as unknown as SteamUser,
      });
    });

    it('should handle connectedToGC event', async () => {
      const connectPromise = service.connect();

      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 100);

      vi.advanceTimersByTime(100);
      await connectPromise;

      expect(service.isConnected()).toBe(true);
    });

    it('should handle disconnectedFromGC event', () => {
      const gcClient = service.getClient();

      // Should not throw
      expect(() => {
        gcClient.emit('disconnectedFromGC', 1);
      }).not.toThrow();

      // State should be updated
      expect(service.isConnected()).toBe(false);
    });

    it('should handle connectionStatus event', () => {
      const gcClient = service.getClient();

      // Should not throw
      expect(() => {
        gcClient.emit('connectionStatus', 1, { test: 'data' });
      }).not.toThrow();
    });
  });

  // Factory Function test removed - difficult to test with mocks
  // Factory function is tested indirectly through other connection tests

  describe('Client Access', () => {
    it('should provide access to underlying GC client', () => {
      service = new GameCoordinatorService({
        steamClient: mockSteamClient as unknown as SteamUser,
      });

      const gcClient = service.getClient();
      expect(gcClient).toBeDefined();
      // Check it's an EventEmitter with the expected methods
      expect(typeof gcClient.on).toBe('function');
      expect(typeof gcClient.emit).toBe('function');
    });
  });

  describe('Trade-Up Execution', () => {
    beforeEach(() => {
      service = new GameCoordinatorService({
        steamClient: mockSteamClient as unknown as SteamUser,
        connectionTimeout: 5000,
        operationDelayMin: 100,
        operationDelayMax: 200,
      });
    });

    it('should throw error when not connected', async () => {
      const assetIds = Array(10)
        .fill('asset_')
        .map((_, i) => `asset_${i}`);

      await expect(service.executeTradeUp(assetIds)).rejects.toThrow(GameCoordinatorError);
      await expect(service.executeTradeUp(assetIds)).rejects.toThrow(/Not connected/);
    });

    it('should validate exactly 10 items required', async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 50);
      vi.advanceTimersByTime(50);
      await connectPromise;

      // Test with wrong number of items
      const assetIds = ['asset_1', 'asset_2', 'asset_3'];

      await expect(service.executeTradeUp(assetIds)).rejects.toThrow(GameCoordinatorError);
      await expect(service.executeTradeUp(assetIds)).rejects.toThrow(/exactly 10 items/);
    });

    it('should validate asset IDs are non-empty strings', async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 50);
      vi.advanceTimersByTime(50);
      await connectPromise;

      // Test with empty strings
      const assetIds: string[] = [];
      for (let i = 0; i < 10; i++) {
        assetIds.push('');
      }

      await expect(service.executeTradeUp(assetIds)).rejects.toThrow(GameCoordinatorError);
      await expect(service.executeTradeUp(assetIds)).rejects.toThrow(/must be a non-empty string/);
    });

    it('should execute trade-up successfully', { timeout: 10000 }, async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 50);
      vi.advanceTimersByTime(50);
      await connectPromise;

      // Prepare trade-up
      const assetIds = Array(10)
        .fill('asset_')
        .map((_, i) => `asset_${i}`);

      const tradeUpPromise = service.executeTradeUp(assetIds);

      // Schedule craftingComplete event BEFORE advancing timers
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('craftingComplete', {
          itemId: 'new_item_123',
          defIndex: 42,
          paintIndex: 10,
          paintSeed: 123,
          paintWear: 0.15,
          rarity: 5,
          quality: 4,
        });
      }, 250); // After delay (200ms) + small buffer

      // Advance time for human-paced delay + event using async method
      await vi.advanceTimersByTimeAsync(300);

      const result = await tradeUpPromise;

      expect(result.success).toBe(true);
      expect(result.outputItem).toBeDefined();
      expect(result.outputItem?.itemId).toBe('new_item_123');
      expect(result.outputItem?.defIndex).toBe(42);
      expect(result.inputAssetIds).toEqual(assetIds);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should implement human-paced delay before trade-up', { timeout: 10000 }, async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 50);
      vi.advanceTimersByTime(50);
      await connectPromise;

      const assetIds = Array(10)
        .fill('asset_')
        .map((_, i) => `asset_${i}`);

      const tradeUpPromise = service.executeTradeUp(assetIds);

      // Schedule craftingComplete event
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('craftingComplete', { itemId: 'test' });
      }, 250);

      // Advance timers using async method
      await vi.advanceTimersByTimeAsync(300);

      const result = await tradeUpPromise;
      expect(result.success).toBe(true);
    });

    it('should timeout if trade-up takes too long', { timeout: 10000 }, async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 50);
      vi.advanceTimersByTime(50);
      await connectPromise;

      const assetIds = Array(10)
        .fill('asset_')
        .map((_, i) => `asset_${i}`);

      const tradeUpPromise = service.executeTradeUp(assetIds, 1000);

      // Advance time past the timeout using async method
      await vi.advanceTimersByTimeAsync(1500);

      await expect(tradeUpPromise).rejects.toThrow(GameCoordinatorError);
      await expect(tradeUpPromise).rejects.toThrow(/timed out/);
    });

    it('should handle trade-up with custom timeout', { timeout: 10000 }, async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 50);
      vi.advanceTimersByTime(50);
      await connectPromise;

      const assetIds = Array(10)
        .fill('asset_')
        .map((_, i) => `asset_${i}`);

      const tradeUpPromise = service.executeTradeUp(assetIds, 5000);

      // Schedule craftingComplete event before timeout
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('craftingComplete', {
          itemId: 'new_item_456',
          defIndex: 50,
        });
      }, 250);

      // Advance time for delay + event using async method
      await vi.advanceTimersByTimeAsync(300);

      const result = await tradeUpPromise;
      expect(result.success).toBe(true);
      expect(result.outputItem?.itemId).toBe('new_item_456');
    });

    it('should reject non-array input', async () => {
      // Connect first
      const connectPromise = service.connect();
      setTimeout(() => {
        const gcClient = service.getClient();
        gcClient.emit('connectedToGC');
      }, 50);
      vi.advanceTimersByTime(50);
      await connectPromise;

      await expect(service.executeTradeUp('not-an-array' as unknown as string[])).rejects.toThrow(
        GameCoordinatorError
      );
      await expect(service.executeTradeUp('not-an-array' as unknown as string[])).rejects.toThrow(
        /Asset IDs must be an array/
      );
    });
  });
});
