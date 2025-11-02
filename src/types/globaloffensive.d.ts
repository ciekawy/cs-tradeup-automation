declare module 'globaloffensive' {
  import { EventEmitter } from 'events';
  import SteamUser from 'steam-user';

  /**
   * GlobalOffensive client for CS2 Game Coordinator protocol
   */
  class GlobalOffensive extends EventEmitter {
    constructor(steamClient: SteamUser);

    /**
     * Event: Connected to Game Coordinator
     */
    on(event: 'connectedToGC', listener: () => void): this;

    /**
     * Event: Disconnected from Game Coordinator
     */
    on(event: 'disconnectedFromGC', listener: (reason: number) => void): this;

    /**
     * Event: Connection status changed
     */
    on(event: 'connectionStatus', listener: (status: number, data: unknown) => void): this;

    /**
     * Generic event listener
     */
    on(event: string, listener: (...args: unknown[]) => void): this;

    /**
     * Remove event listener
     */
    off(event: string, listener: (...args: unknown[]) => void): this;

    /**
     * One-time event listener
     */
    once(event: string, listener: (...args: unknown[]) => void): this;

    /**
     * Event: Trade-up craft completed
     */
    on(event: 'craftingComplete', listener: (result: CraftingResult) => void): this;

    /**
     * Execute a trade-up contract with 10 item asset IDs
     * @param assetIDs Array of 10 asset IDs for trade-up contract
     */
    craft(assetIDs: string[]): void;
  }

  /**
   * Result of a trade-up crafting operation
   */
  interface CraftingResult {
    itemId?: string;
    defIndex?: number;
    paintIndex?: number;
    paintSeed?: number;
    paintWear?: number;
    rarity?: number;
    quality?: number;
    [key: string]: unknown;
  }

  export = GlobalOffensive;
}
