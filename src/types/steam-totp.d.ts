/**
 * Type declarations for steam-totp library
 * https://github.com/DoctorMcKay/node-steam-totp
 */

declare module 'steam-totp' {
  /**
   * Generate a Steam Guard Mobile Authenticator code
   * @param secret Shared secret from Steam Guard
   * @param timeOffset Optional time offset in seconds
   * @returns 5-character alphanumeric Steam Guard code
   */
  export function generateAuthCode(secret: string, timeOffset?: number): string;

  /**
   * Generate a confirmation key for trade/market confirmations
   * @param identitySecret Identity secret from Steam Guard
   * @param time Current time in seconds
   * @param tag Confirmation type tag
   * @returns Confirmation key string
   */
  export function generateConfirmationKey(
    identitySecret: string,
    time: number,
    tag: string
  ): string;

  /**
   * Get current Steam time
   * @param callback Callback with error and time
   */
  export function getServerTime(callback: (error: Error | null, time: number) => void): void;

  /**
   * Get time offset from Steam servers
   * @param callback Callback with error and time offset
   */
  export function getTimeOffset(callback: (error: Error | null, offset: number) => void): void;
}
