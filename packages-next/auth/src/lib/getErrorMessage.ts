import { AuthErrorCode } from '../types';

export function getErrorMessage(
  identityField: string,
  secretField: string,
  itemSingular: string,
  itemPlural: string,
  code: AuthErrorCode
): string {
  switch (code) {
    case 'PASSWORD_AUTH_FAILURE':
      return 'Authentication failed.';
    case 'PASSWORD_AUTH_IDENTITY_NOT_FOUND':
      return `The ${identityField} value provided didn't identify any ${itemPlural}.`;
    case 'PASSWORD_AUTH_SECRET_NOT_SET':
      return `The ${itemSingular} identified has no ${secretField} set so can not be authenticated.`;
    case 'PASSWORD_AUTH_MULTIPLE_IDENTITY_MATCHES':
      return `The ${identityField} value provided identified more than one ${itemSingular}.`;
    case 'PASSWORD_AUTH_SECRET_MISMATCH':
      return `The ${secretField} provided is incorrect.`;

    case 'AUTH_TOKEN_REQUEST_IDENTITY_NOT_FOUND':
      return `The ${identityField} value provided didn't identify any ${itemPlural}.`;
    case 'AUTH_TOKEN_REQUEST_MULTIPLE_IDENTITY_MATCHES':
      return `The ${identityField} value provided identified more than one ${itemSingular}.`;
    case 'AUTH_TOKEN_REDEMPTION_FAILURE':
      return 'Auth token redemtion failed.';
    case 'AUTH_TOKEN_REDEMPTION_IDENTITY_NOT_FOUND':
      return `The ${identityField} value provided didn't identify any ${itemPlural}.`;
    case 'AUTH_TOKEN_REDEMPTION_MULTIPLE_IDENTITY_MATCHES':
      return `The ${identityField} value provided identified more than one ${itemSingular}.`;
    case 'AUTH_TOKEN_REDEMPTION_TOKEN_NOT_SET':
      return `The ${itemSingular} identified has no auth token of this type set.`;
    case 'AUTH_TOKEN_REDEMPTION_TOKEN_MISMATCH':
      return 'The auth token provided is incorrect.';
    case 'AUTH_TOKEN_REDEMPTION_TOKEN_EXPIRED':
      return 'The auth token provided has expired.';
    case 'AUTH_TOKEN_REDEMPTION_TOKEN_REDEEMED':
      return 'Auth tokens are single use and the auth token provided has already been redeemed.';

    case 'INTERNAL_ERROR':
      return `An unexpected error condition was encountered while creating or redeeming an auth token.`;
  }
  return 'No error message defined.';
}
