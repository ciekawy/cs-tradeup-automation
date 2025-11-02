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
 * Trade-up execution result interface
 */
export interface TradeUpResult {
  success: boolean;
  outputItem?: {
    itemId?: string;
    defIndex?: number;
    paintIndex?: number;
    paintSeed?: number;
    paintWear?: number;
    rarity?: number;
    quality?: number;
  };
  inputAssetIds: string[];
  timestamp: Date;
}

/**
 * Trade-up validation error interface
 */
export interface TradeUpValidationError {
  valid: boolean;
  errors: string[];
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
   * Validate trade-up input requirements
   *
   * @param assetIds Array of asset IDs to validate
   * @returns Validation result with errors if any
   */
  private validateTradeUpInput(assetIds: string[]): TradeUpValidationError {
    const errors: string[] = [];

    // Validate asset ID count
    if (!Array.isArray(assetIds)) {
      errors.push('Asset IDs must be an array');
    } else if (assetIds.length !== 10) {
      errors.push(`Trade-up requires exactly 10 items, got ${assetIds.length}`);
    }

    // Validate asset IDs are strings
    if (Array.isArray(assetIds)) {
      assetIds.forEach((assetId, index) => {
        if (typeof assetId !== 'string' || assetId.trim() === '') {
          errors.push(`Asset ID at index ${index} must be a non-empty string`);
        }
      });
    }

    // TODO: Add rarity validation (requires inventory metadata)
    // TODO: Add collection validation (requires item database)
    // TODO: Add trade-lock validation (requires item status check)

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Execute a trade-up contract
   *
   * CRITICAL: Implements human-paced delay (30-60s) before execution
   * to prevent Steam ban detection.
   *
   * @param assetIds Array of exactly 10 asset IDs for trade-up
   * @param timeout Timeout for trade-up completion (default: 30s)
   * @returns Promise that resolves with trade-up result
   * @throws GameCoordinatorError if validation fails, not connected, or operation fails
   */
  async executeTradeUp(assetIds: string[], timeout: number = 30000): Promise<TradeUpResult> {
    // Validate GC connection
    if (!this.state.isConnected) {
      throw new GameCoordinatorError(
        'Not connected to Game Coordinator. Call connect() first.',
        'GC_NOT_CONNECTED'
      );
    }

    // Validate input
    const validation = this.validateTradeUpInput(assetIds);
    if (!validation.valid) {
      throw new GameCoordinatorError(
        `Trade-up input validation failed: ${validation.errors.join(', ')}`,
        'TRADEUP_INVALID_INPUT'
      );
    }

    // CRITICAL: Human-paced delay before trade-up execution
    const delay = this.calculateOperationDelay();
    console.log(
      `[GC] CRITICAL: Implementing human-paced delay of ${Math.round(delay / 1000)}s before trade-up execution to avoid Steam ban detection`
    );
    console.log('[GC] Trade-ups are irreversible - this delay is mandatory for safety');
    await this.delay(delay);

    // Execute trade-up with timeout
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        cleanup();
        reject(
          new GameCoordinatorError(
            `Trade-up execution timed out after ${timeout}ms`,
            'TRADEUP_TIMEOUT'
          )
        );
      }, timeout);

      const onCraftingComplete = (result: Record<string, unknown>) => {
        clearTimeout(timeoutHandle);
        cleanup();

        console.log('[GC] Trade-up completed successfully:', result);

        const tradeUpResult: TradeUpResult = {
          success: true,
          outputItem: {
            itemId: result.itemId as string | undefined,
            defIndex: result.defIndex as number | undefined,
            paintIndex: result.paintIndex as number | undefined,
            paintSeed: result.paintSeed as number | undefined,
            paintWear: result.paintWear as number | undefined,
            rarity: result.rarity as number | undefined,
            quality: result.quality as number | undefined,
          },
          inputAssetIds: assetIds,
          timestamp: new Date(),
        };

        resolve(tradeUpResult);
      };

      const cleanup = () => {
        this.gcClient.off('craftingComplete', onCraftingComplete);
      };

      // Attach event listener
      this.gcClient.once('craftingComplete', onCraftingComplete);

      // Execute craft() method
      console.log(`[GC] Executing trade-up with ${assetIds.length} items...`);
      try {
        this.gcClient.craft(assetIds);
      } catch (error) {
        clearTimeout(timeoutHandle);
        cleanup();
        reject(
          new GameCoordinatorError(
            `Failed to execute trade-up: ${error instanceof Error ? error.message : String(error)}`,
            'TRADEUP_EXECUTION_FAILED',
            error instanceof Error ? error : undefined
          )
        );
      }
    });
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
