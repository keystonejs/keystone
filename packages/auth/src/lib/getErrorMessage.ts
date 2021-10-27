import { AuthTokenRedemptionErrorCode } from '../types';

export function getAuthTokenErrorMessage({ code }: { code: AuthTokenRedemptionErrorCode }): string {
  switch (code) {
    case 'FAILURE':
      return 'Auth token redemption failed.';
    case 'TOKEN_EXPIRED':
      return 'The auth token provided has expired.';
    case 'TOKEN_REDEEMED':
      return 'Auth tokens are single use and the auth token provided has already been redeemed.';
  }
}
