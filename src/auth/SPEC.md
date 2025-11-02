# Authentication Service Component Specification

**Component**: Authentication Service (Steam)
**Version**: 1.0.0
**Status**: Implementation In Progress
**Last Updated**: 2025-11-02

## Overview

Provides Steam authentication and session management for CS2 Trade-Up Educational Bot using the steam-user library. Handles login flow, 2FA, error recovery, and human-paced delays to mitigate Steam ban risks.

## API Contract

### Authentication Interface

```typescript
interface AuthenticationService {
  /**
   * Authenticate with Steam using credentials from environment variables
   * @returns Promise<SteamUser> - Authenticated Steam user instance
   * @throws AuthenticationError - Invalid credentials or authentication failure
   */
  authenticate(): Promise<SteamUser>;

  /**
   * Get current authentication status
   * @returns boolean - True if authenticated and session valid
   */
  isAuthenticated(): boolean;

  /**
   * Disconnect from Steam
   * @returns Promise<void>
   */
  disconnect(): Promise<void>;
}

interface AuthenticationConfig {
  username: string;
  password: string;
  sharedSecret?: string; // For 2FA (Steam Guard Mobile Authenticator)
  maxRetries: number; // Max authentication retry attempts (default: 5)
  retryDelayMin: number; // Min delay between retries in ms (default: 30000)
  retryDelayMax: number; // Max delay between retries in ms (default: 60000)
}
```

### Authentication Flow

```typescript
/**
 * Authentication flow sequence:
 * 1. Load credentials from environment variables (.env file)
 * 2. Create SteamUser instance
 * 3. Attempt login with username/password
 * 4. Handle 2FA prompt (auto-respond with shared secret if available)
 * 5. Log successful authentication (SteamID, account name)
 * 6. Handle connection errors with exponential backoff
 * 7. Enforce human-paced delays (30-60s) between attempts
 */
```

## Data Model

### Authentication State

```typescript
interface AuthenticationState {
  isAuthenticated: boolean;
  steamId?: string;
  accountName?: string;
  sessionToken?: string;
  lastAuthTime?: Date;
  retryCount: number;
  lastError?: Error;
}
```

### Session Management

```typescript
interface SessionData {
  steamId: string;
  accountName: string;
  refreshToken?: string;
  sessionExpiry?: Date;
}
```

## Edge Cases & Error Handling

### Invalid Credentials

- **Scenario**: Username/password incorrect
- **Response**: Throw `AuthenticationError` with clear message
- **Retry**: No automatic retry (user must fix credentials)

### 2FA Required

- **Scenario**: Steam Guard Mobile Authenticator code needed
- **Response**:
  - If `STEAM_SHARED_SECRET` present: Auto-generate code
  - Otherwise: Prompt user for manual code entry
- **Retry**: Allow retry after code entry

### Network Errors

- **Scenario**: Connection timeout, DNS failure, Steam API unavailable
- **Response**: Retry with exponential backoff (max 5 attempts)
- **Backoff**: Start at 30s, increase by 2x each retry, max 60s
- **Human Pacing**: Randomized delays (30-60s) between attempts

### Rate Limiting

- **Scenario**: Too many authentication attempts
- **Response**: Enforce human-paced delays (30-60s minimum)
- **Documentation**: Log warning about Steam ban risk
- **Mitigation**: Never allow rapid-fire retries

### Session Expiry

- **Scenario**: Session token expires during operation
- **Response**: Re-authenticate automatically with stored credentials
- **Notification**: Log session refresh event

## Dependencies

### External Libraries

- **steam-user** (v5.2.3)
  - Purpose: Steam authentication, session management, 2FA handling
  - Repository: https://github.com/DoctorMcKay/node-steam-user
  - Events: `loggedOn`, `error`, `steamGuard`, `disconnected`

### Environment Variables

```bash
STEAM_USERNAME=your_steam_username
STEAM_PASSWORD=your_steam_password
STEAM_SHARED_SECRET=your_shared_secret  # Optional, for 2FA
```

### Configuration Files

- `.env` - Environment variables (gitignored)
- `.env.example` - Template for required variables

## Testing Strategy

### Unit Tests (Mocked)

```typescript
describe('Authentication Service', () => {
  it('should authenticate with valid credentials', async () => {
    // Mock steam-user to simulate successful login
  });

  it('should handle 2FA with shared secret', async () => {
    // Mock steamGuard event and verify auto-response
  });

  it('should retry on network errors with exponential backoff', async () => {
    // Mock connection failures and verify retry logic
  });

  it('should enforce human-paced delays between retries', async () => {
    // Verify delays are randomized between 30-60s
  });

  it('should throw error on invalid credentials', async () => {
    // Mock authentication failure and verify error handling
  });
});
```

### Integration Tests (Real Steam API - Manual)

- Test with real Steam credentials (development only)
- Verify 2FA flow with mobile authenticator
- Test session persistence across reconnects
- Validate error recovery mechanisms

### Test Coverage Requirements

- **Minimum**: 80% code coverage
- **Critical Paths**: 100% coverage (authentication flow, error handling)
- **Edge Cases**: All error scenarios tested

## Security Considerations

### Credential Protection

- **Never commit credentials**: Use .env files (gitignored)
- **Environment variables only**: Load credentials at runtime
- **Secure logging**: Never log passwords or shared secrets

### Session Token Security

- **Persist securely**: Store tokens in /data volume with restricted permissions
- **Encrypt at rest**: Consider token encryption for production
- **Auto-refresh**: Handle token expiry automatically

### Ban Mitigation (CRITICAL)

- **Human-paced delays**: 30-60s randomized delays between auth attempts
- **Low volume**: Limit authentication attempts to reasonable levels
- **Rate limiting**: Prevent rapid-fire retries
- **Documentation**: Clearly document why delays are necessary in code comments

## Performance Considerations

### Authentication Time

- **Expected**: 2-5 seconds for successful login
- **With 2FA**: +2-3 seconds for code generation
- **Retry delays**: 30-60s between attempts (intentional)

### Resource Usage

- **Memory**: <10MB for authentication service
- **Network**: Minimal (HTTPS to Steam API)
- **CPU**: Negligible (event-driven, async)

## Linked Specifications

**Task**: [TASK-004 - Steam Authentication](https://github.com/ciekawy/cs-tradeup-automation/issues/15)
**Story**: [Story #9 - Steam Authentication](https://github.com/ciekawy/cs-tradeup-automation/issues/9)
**Epic**: [Epic #2 - Core Automation Loop](https://github.com/ciekawy/cs-tradeup-automation/issues/2)

## Change Log

### 2025-11-02 - TASK-004 - Initial Specification

**Changes**: Created initial authentication service specification
**Author**: task-implement workflow
**Status**: Specification complete, implementation in progress
