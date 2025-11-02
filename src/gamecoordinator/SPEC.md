# Game Coordinator Component Specification

**Component**: Game Coordinator Service
**Purpose**: CS2 Game Coordinator protocol integration for inventory retrieval and trade-up execution
**Status**: Active Development
**Last Updated**: 2025-11-02

## Overview

The Game Coordinator Service provides CS2 Game Coordinator (GC) protocol integration using the `node-globaloffensive` library. It manages GC connection lifecycle, inventory retrieval, and implements human-paced delays to mitigate Steam ban risks.

## API Contract

### GameCoordinatorService Class

#### Constructor

```typescript
constructor(config: GameCoordinatorConfig)
```

**Parameters**:

- `config.steamClient`: Authenticated SteamUser client instance (required)
- `config.connectionTimeout`: Timeout for GC connection in ms (default: 30000)
- `config.operationDelayMin`: Minimum delay between GC operations in ms (default: 30000)
- `config.operationDelayMax`: Maximum delay between GC operations in ms (default: 60000)

**Throws**: N/A (constructor does not throw)

#### Methods

##### `async connect(): Promise<void>`

Connects to CS2 Game Coordinator by launching CS2 app (730).

**Returns**: Promise that resolves when connected to GC
**Throws**: `GameCoordinatorError` if connection fails or times out
**Side Effects**: Launches CS2 app via Steam client, emits connection events

##### `async disconnect(): Promise<void>`

Disconnects from CS2 Game Coordinator by stopping CS2 app.

**Returns**: Promise that resolves when disconnected
**Throws**: N/A (does not throw)
**Side Effects**: Stops CS2 app via Steam client, emits disconnection events

##### `async getInventory(): Promise<InventoryItem[]>`

Retrieves CS2 inventory with asset IDs. Implements human-paced delay (30-60s) before request.

**Returns**: Promise that resolves with array of inventory items
**Throws**:

- `GameCoordinatorError` if not connected (code: `GC_NOT_CONNECTED`)
  **Side Effects**: Applies 30-60s delay, logs GC operation

**Note**: Currently returns placeholder empty array. Full implementation pending.

##### `isConnected(): boolean`

Checks if currently connected to Game Coordinator.

**Returns**: True if connected to GC
**Throws**: N/A

##### `getState(): Readonly<GameCoordinatorState>`

Gets current Game Coordinator state.

**Returns**: Readonly copy of current state
**Throws**: N/A

##### `getClient(): GlobalOffensive`

Gets underlying GlobalOffensive client for advanced operations.

**Returns**: GlobalOffensive client instance
**Throws**: N/A

### Factory Function

```typescript
async function createConnectedGCClient(
  config: GameCoordinatorConfig
): Promise<GameCoordinatorService>;
```

Creates and connects a Game Coordinator client in one operation.

**Returns**: Promise that resolves to connected GameCoordinatorService
**Throws**: `GameCoordinatorError` if connection fails

## Data Models

### GameCoordinatorConfig

```typescript
interface GameCoordinatorConfig {
  steamClient: SteamUser;
  connectionTimeout?: number;
  operationDelayMin?: number;
  operationDelayMax?: number;
}
```

### GameCoordinatorState

```typescript
interface GameCoordinatorState {
  isConnected: boolean;
  lastConnectTime?: Date;
  lastDisconnectTime?: Date;
  connectionAttempts: number;
  lastError?: Error;
}
```

### InventoryItem

```typescript
interface InventoryItem {
  assetId: string;
  defIndex: number;
  itemId?: string;
  paintIndex?: number;
  paintSeed?: number;
  paintWear?: number;
  rarity?: number;
  quality?: number;
  [key: string]: unknown;
}
```

### GameCoordinatorError

```typescript
class GameCoordinatorError extends Error {
  constructor(message: string, code?: string, cause?: Error);
  name: 'GameCoordinatorError';
  code?: string;
  cause?: Error;
}
```

**Error Codes**:

- `GC_CONNECTION_TIMEOUT`: Connection to GC timed out
- `GC_NOT_CONNECTED`: Operation attempted without GC connection

## Edge Cases & Error Handling

### Connection Failures

**Scenario**: GC connection times out after 30 seconds
**Handling**: Reject connect() promise with `GameCoordinatorError` (code: `GC_CONNECTION_TIMEOUT`)
**Recovery**: Caller should retry with exponential backoff

### Operation Without Connection

**Scenario**: getInventory() called before connect() or after disconnect()
**Handling**: Throw `GameCoordinatorError` (code: `GC_NOT_CONNECTED`)
**Recovery**: Caller must call connect() first

### Steam Client Disconnection

**Scenario**: Steam client disconnects while GC connected
**Handling**: GC automatically disconnects, emits `disconnectedFromGC` event
**Recovery**: Re-establish Steam connection, then reconnect to GC

### Ban Mitigation Delays

**Scenario**: All GC operations require 30-60s human-paced delays
**Handling**: Automatic delay before inventory requests
**Critical**: Do not bypass or reduce these delays - they prevent Steam ban detection

## Dependencies

### External Dependencies

- `steam-user` (^5.2.3): Steam authentication client
- `globaloffensive` (^3.2.0): CS2 Game Coordinator protocol library

### Internal Dependencies

- None (standalone component)

### Integration Points

- **AuthenticationService**: Requires authenticated SteamUser client from auth module
- **Future**: Trade-up execution service will depend on this component

## Testing Strategy

### Unit Tests

1. **Constructor Tests**:
   - Creates client with default config
   - Creates client with custom config
   - Initializes state correctly

2. **Connection Tests**:
   - Successful connection to GC
   - Connection timeout handling
   - Already connected scenario
   - Connection retry tracking

3. **Disconnection Tests**:
   - Successful disconnection from GC
   - Already disconnected scenario
   - Timeout fallback for missing event

4. **Inventory Tests**:
   - Throws error when not connected
   - Implements human-paced delay
   - Returns inventory items (when implemented)

5. **State Management Tests**:
   - isConnected() accuracy
   - getState() returns readonly copy
   - State updates on connection/disconnection

6. **Error Handling Tests**:
   - GameCoordinatorError with codes
   - Error cause propagation

### Integration Tests

1. **With AuthenticationService**:
   - Connect after successful Steam authentication
   - Handle Steam disconnection gracefully
   - Verify GC connection uses authenticated client

2. **Event Flow Tests**:
   - connectedToGC event handling
   - disconnectedFromGC event handling
   - connectionStatus event logging

### Mocking Strategy

- Mock `steam-user` client with event emitters
- Mock `globaloffensive` library responses
- Mock setTimeout/Promise delays for faster tests
- Do not make real GC connections in unit tests

## Steam Ban Mitigation Patterns

### Human-Paced Delays

- **All GC operations**: 30-60s randomized delay
- **Connection attempts**: Track and space out retries
- **Inventory requests**: Mandatory delay before request
- **Critical**: Never bypass these delays in production

### Rate Limiting Integration

- Coordinate with AuthenticationService rate limiting
- Apply same daily/monthly volume tracking patterns
- Consider GC operations in overall Steam activity budget

### Best Practices

- Minimize unnecessary GC queries
- Cache inventory data when possible
- Batch operations where feasible
- Log all GC events for auditing

## Performance Considerations

### Connection Time

- GC connection: Typically 5-15 seconds after Steam authentication
- Timeout: 30 seconds to prevent indefinite hanging
- Retry strategy: Handled by caller (not built into service)

### Memory Usage

- Minimal: Single GlobalOffensive client instance
- State tracking: <1KB per service instance
- Inventory caching: Future optimization

### Network Efficiency

- GC uses persistent connection (no reconnection overhead)
- Inventory requests: Single roundtrip when implemented
- Event-driven architecture reduces polling

## Security Considerations

### Credential Handling

- No credentials stored in this component
- Relies on authenticated SteamUser client from AuthenticationService
- No session token exposure

### Data Privacy

- Inventory data: User's own CS2 items only
- No third-party data access
- Logs: Plain text, no sensitive data (asset IDs are public)

### Steam ToS Compliance

- Component explicitly violates Steam ToS automation clause
- Mitigation: Human-paced delays, low volume, test account isolation
- Educational purpose clearly documented

## Linked Specifications

**Story**: [#10 - GC Protocol & Trade-Up Execution](https://github.com/ciekawy/cs-tradeup-automation/issues/10)
**Task**: [#18 - TASK-007: Implement GC protocol connection and inventory retrieval](https://github.com/ciekawy/cs-tradeup-automation/issues/18)
**Feature**: Epic 2 - Core Automation Loop

## Change Log

### 2025-11-02 - TASK-007 (Initial Implementation)

**Changes**:

- Created GameCoordinatorService class with GC connection and disconnection
- Implemented human-paced delays for ban mitigation (30-60s)
- Added GameCoordinatorError with error codes
- Created factory function for connected client creation
- Added placeholder getInventory() method (full implementation pending)
- Created TypeScript type definitions for globaloffensive library

**Author**: task-implement workflow
**Validation**: Tests pending, connection logic implemented

## Future Enhancements

### Iteration 2 (Next)

- Implement full inventory retrieval using Steam inventory API
- Add asset ID extraction and parsing
- Cache inventory data to reduce GC queries

### Iteration 3

- Implement trade-up execution via craft() method
- Add trade-up result handling and validation
- Integrate with EV calculation engine

### Iteration 4

- Add GC connection health monitoring
- Implement automatic reconnection on disconnection
- Add telemetry for GC operation metrics
