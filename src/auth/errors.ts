/**
 * Custom error classes for authentication failures
 *
 * Provides structured error handling with Steam EResult codes
 * for better debugging and graceful error recovery.
 */

/**
 * Base authentication error class
 */
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'AuthenticationError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Rate limit exceeded error
 * Thrown when authentication attempts exceed configured limits
 */
export class RateLimitError extends AuthenticationError {
  constructor(
    message: string,
    public readonly dailyLimit?: number,
    public readonly monthlyLimit?: number,
    public readonly currentDaily?: number,
    public readonly currentMonthly?: number
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

/**
 * Steam protocol error with EResult code
 * Maps Steam's error codes to structured errors
 */
export class SteamProtocolError extends AuthenticationError {
  constructor(
    message: string,
    public readonly eresult: number,
    public readonly eresultName?: string
  ) {
    super(message, `STEAM_ERESULT_${eresult}`);
    this.name = 'SteamProtocolError';
  }

  /**
   * Check if error is critical and requires graceful shutdown
   */
  isCritical(): boolean {
    // Critical EResult codes that indicate permanent failures
    // EResult values verified from: https://steamerrors.com/
    const criticalResults = [
      5, // InvalidPassword
      17, // Banned (VAC2 banned)
      43, // AccountDisabled
      63, // AccountLogonDenied (need Steam Guard email code)
      73, // AccountLockedDown
      84, // RateLimitExceeded
      85, // AccountLoginDeniedNeedTwoFactor (need TOTP code)
      87, // AccountLoginDeniedThrottle (rate limited by Steam)
    ];

    return criticalResults.includes(this.eresult);
  }
}

/**
 * Session management error
 */
export class SessionError extends AuthenticationError {
  constructor(message: string, cause?: Error) {
    super(message, 'SESSION_ERROR', cause);
    this.name = 'SessionError';
  }
}

/**
 * Network/timeout error
 */
export class NetworkError extends AuthenticationError {
  constructor(message: string, cause?: Error) {
    super(message, 'NETWORK_ERROR', cause);
    this.name = 'NetworkError';
  }
}

/**
 * 2FA/Steam Guard error
 */
export class TwoFactorError extends AuthenticationError {
  constructor(message: string) {
    super(message, '2FA_REQUIRED');
    this.name = 'TwoFactorError';
  }
}

/**
 * Helper function to wrap Steam errors with structured error classes
 */
export function wrapSteamError(error: unknown): AuthenticationError {
  // Check if it's already one of our custom errors
  if (error instanceof AuthenticationError) {
    return error;
  }

  // Type guard for error objects
  if (typeof error !== 'object' || error === null) {
    return new AuthenticationError('Unknown authentication error');
  }

  // Extract EResult code if present
  const errorObj = error as { eresult?: number; code?: string | number; message?: string };
  const eresult = errorObj.eresult ?? errorObj.code;

  if (typeof eresult === 'number') {
    const eresultName = getEResultName(eresult);
    return new SteamProtocolError(
      errorObj.message ?? `Steam error: ${eresultName}`,
      eresult,
      eresultName
    );
  }

  // Check for network/timeout errors
  const code = errorObj.code;
  if (code === 'ETIMEDOUT' || code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
    return new NetworkError(errorObj.message ?? 'Network error', error as Error);
  }

  // Generic authentication error
  return new AuthenticationError(
    errorObj.message ?? 'Unknown authentication error',
    undefined,
    error as Error
  );
}

/**
 * Get human-readable name for Steam EResult code
 * Source: https://steamerrors.com/
 */
export function getEResultName(eresult: number): string {
  const eresultNames: Record<number, string> = {
    1: 'OK',
    2: 'Fail',
    3: 'NoConnection',
    5: 'InvalidPassword',
    6: 'LoggedInElsewhere',
    17: 'FileNotFound',
    18: 'Busy',
    19: 'InvalidState',
    20: 'InvalidName',
    21: 'InvalidEmail',
    22: 'DuplicateName',
    23: 'AccessDenied',
    24: 'Timeout',
    25: 'Banned',
    26: 'AccountNotFound',
    27: 'InvalidSteamID',
    34: 'AccountDisabled',
    41: 'ServiceUnavailable',
    42: 'NotLoggedOn',
    50: 'InvalidProtocolVer',
    51: 'InvalidParam',
    63: 'Expired',
    65: 'AccountLoginDenied',
    71: 'TwoFactorCodeMismatch',
    84: 'RateLimitExceeded',
    85: 'AccountLocked',
    86: 'AccountLogonDenied',
    87: 'CannotUse',
    88: 'InvalidCellId',
    89: 'AccountLogonDeniedNeedTwoFactor',
    93: 'AccountLoginDeniedNoMail',
    101: 'HardwareNotCapableOfIPT',
    102: 'IPTInitError',
    103: 'ParentalControlRestricted',
  };

  return eresultNames[eresult] || `Unknown(${eresult})`;
}
