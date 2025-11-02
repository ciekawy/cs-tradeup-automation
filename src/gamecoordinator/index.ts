import SteamUser from 'steam-user';
import GlobalOffensive from 'globaloffensive';

/**
 * Game Coordinator configuration interface
 */
export interface GameCoordinatorConfig {
  steamClient: SteamUser;
  connectionTimeout?: number; // Timeout for GC connection (default: 30s)
  operationDelayMin?: number; // Minimum delay between GC operations (default: 30s)
  operationDelayMax?: number; // Maximum delay between GC operations (default: 60s)
}

/**
 * Game Coordinator state interface
 */
export interface GameCoordinatorState {
  isConnected: boolean;
  lastConnectTime?: Date;
  lastDisconnectTime?: Date;
  connectionAttempts: number;
  lastError?: Error;
}

/**
 * CS2 inventory item interface
 */
export interface InventoryItem {
  assetId: string;
  defIndex: number;
  itemId?: string;
  paintIndex?: number;
  paintSeed?: number;
  paintWear?: number;
  rarity?: number;
  quality?: number;
  [key: string]: unknown; // Allow additional properties from GC response
}

/**
 * Game Coordinator Error class
 */
export class GameCoordinatorError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'GameCoordinatorError';
  }
}

/**
 * CS2 Game Coordinator Service
 *
 * Provides CS2 Game Coordinator protocol integration for inventory retrieval
 * and trade-up execution. Implements human-paced delays to mitigate ban risks.
 *
 * CRITICAL: All GC operations include 30-60s randomized delays to prevent
 * Steam rate limiting and account restrictions.
 */
export class GameCoordinatorService {
  private gcClient: GlobalOffensive;
  private steamClient: SteamUser;
  private config: Required<GameCoordinatorConfig>;
  private state: GameCoordinatorState;

  constructor(config: GameCoordinatorConfig) {
    this.steamClient = config.steamClient;
    this.config = {
      steamClient: config.steamClient,
      connectionTimeout: config.connectionTimeout ?? 30000, // 30 seconds
      operationDelayMin: config.operationDelayMin ?? 30000, // 30 seconds
      operationDelayMax: config.operationDelayMax ?? 60000, // 60 seconds
    };

    // Initialize state
    this.state = {
      isConnected: false,
      connectionAttempts: 0,
    };

    // Create GlobalOffensive client
    this.gcClient = new GlobalOffensive(this.steamClient);

    // Setup event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for Game Coordinator client
   */
  private setupEventHandlers(): void {
    // GC connection established
    this.gcClient.on('connectedToGC', () => {
      this.state.isConnected = true;
      this.state.lastConnectTime = new Date();
      this.state.connectionAttempts = 0;
      console.log('[GC] Successfully connected to CS2 Game Coordinator');
    });

    // GC disconnection
    this.gcClient.on('disconnectedFromGC', (reason: number) => {
      this.state.isConnected = false;
      this.state.lastDisconnectTime = new Date();
      console.log(`[GC] Disconnected from CS2 Game Coordinator (reason: ${reason})`);
    });

    // GC connection status changes
    this.gcClient.on('connectionStatus', (status: number, data: unknown) => {
      console.log(`[GC] Connection status changed: ${status}`, data);
    });
  }

  /**
   * Connect to CS2 Game Coordinator
   *
   * Launches CS2 app (730) to establish GC connection.
   * Waits for connectedToGC event with timeout.
   *
   * @returns Promise that resolves when connected to GC
   * @throws GameCoordinatorError if connection fails or times out
   */
  async connect(): Promise<void> {
    if (this.state.isConnected) {
      console.log('[GC] Already connected to Game Coordinator');
      return;
    }

    this.state.connectionAttempts++;

    return new Promise((resolve, reject) => {
      // Set connection timeout
      const timeout = setTimeout(() => {
        cleanup();
        const error = new GameCoordinatorError(
          `GC connection timed out after ${this.config.connectionTimeout}ms`,
          'GC_CONNECTION_TIMEOUT'
        );
        this.state.lastError = error;
        reject(error);
      }, this.config.connectionTimeout);

      // Setup one-time listeners for connection
      const onConnected = () => {
        clearTimeout(timeout);
        cleanup();
        console.log('[GC] Connection established successfully');
        resolve();
      };

      const cleanup = () => {
        this.gcClient.off('connectedToGC', onConnected);
      };

      // Attach listeners
      this.gcClient.once('connectedToGC', onConnected);

      // Launch CS2 app to trigger GC connection
      console.log('[GC] Launching CS2 app (730) to connect to Game Coordinator...');
      this.steamClient.gamesPlayed([730]); // CS2 app ID
    });
  }

  /**
   * Disconnect from CS2 Game Coordinator
   *
   * Stops playing CS2 app to trigger GC disconnection.
   *
   * @returns Promise that resolves when disconnected
   */
  async disconnect(): Promise<void> {
    if (!this.state.isConnected) {
      console.log('[GC] Already disconnected from Game Coordinator');
      return;
    }

    return new Promise((resolve) => {
      // Setup one-time listener for disconnection
      const onDisconnected = () => {
        console.log('[GC] Disconnection confirmed');
        resolve();
      };

      this.gcClient.once('disconnectedFromGC', onDisconnected);

      // Stop playing CS2 app
      console.log('[GC] Stopping CS2 app to disconnect from Game Coordinator...');
      this.steamClient.gamesPlayed([]);

      // Fallback timeout in case disconnected event doesn't fire
      setTimeout(() => {
        this.state.isConnected = false;
        resolve();
      }, 5000);
    });
  }

  /**
   * Retrieve CS2 inventory
   *
   * CRITICAL: Implements human-paced delay before inventory request
   * to prevent Steam ban detection.
   *
   * @returns Promise that resolves with inventory items
   * @throws GameCoordinatorError if not connected or retrieval fails
   */
  async getInventory(): Promise<InventoryItem[]> {
    if (!this.state.isConnected) {
      throw new GameCoordinatorError(
        'Not connected to Game Coordinator. Call connect() first.',
        'GC_NOT_CONNECTED'
      );
    }

    // CRITICAL: Human-paced delay before GC operation
    const delay = this.calculateOperationDelay();
    console.log(
      `[GC] CRITICAL: Implementing human-paced delay of ${Math.round(delay / 1000)}s before inventory request to avoid Steam ban detection`
    );
    await this.delay(delay);

    // Note: node-globaloffensive doesn't have a direct getInventory method
    // Inventory retrieval typically requires requesting player profile
    // or using Steam's inventory API separately
    // For now, we'll implement a placeholder that can be expanded
    console.log('[GC] Requesting CS2 inventory...');

    // TODO: Implement actual inventory retrieval
    // This would typically involve:
    // 1. Using Steam's inventory API (separate from GC)
    // 2. Or requesting player profile via GC if available
    // For now, return empty array as placeholder
    console.warn(
      '[GC] WARNING: Inventory retrieval not yet fully implemented. This is a placeholder.'
    );
    return [];
  }

  /**
   * Check if connected to Game Coordinator
   *
   * @returns True if connected to GC
   */
  isConnected(): boolean {
    return this.state.isConnected;
  }

  /**
   * Get current Game Coordinator state
   *
   * @returns Current GC state
   */
  getState(): Readonly<GameCoordinatorState> {
    return { ...this.state };
  }

  /**
   * Calculate operation delay with randomization
   *
   * CRITICAL: This delay is REQUIRED to prevent Steam ban detection.
   * Do not remove or reduce these delays.
   *
   * @returns Delay in milliseconds
   */
  private calculateOperationDelay(): number {
    const baseDelay = this.config.operationDelayMin;
    const maxJitter = this.config.operationDelayMax - this.config.operationDelayMin;
    const jitter = maxJitter * Math.random();
    return baseDelay + jitter;
  }

  /**
   * Delay utility with human-pacing explanation
   *
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get the underlying GlobalOffensive client
   *
   * Provides access to the raw GC client for advanced operations
   * not covered by this service.
   *
   * @returns GlobalOffensive client instance
   */
  getClient(): GlobalOffensive {
    return this.gcClient;
  }
}

/**
 * Factory function to create and connect a Game Coordinator client
 *
 * @param config Game Coordinator configuration
 * @returns Promise that resolves to connected GameCoordinatorService
 * @throws GameCoordinatorError if connection fails
 */
export async function createConnectedGCClient(
  config: GameCoordinatorConfig
): Promise<GameCoordinatorService> {
  const service = new GameCoordinatorService(config);
  await service.connect();
  return service;
}
