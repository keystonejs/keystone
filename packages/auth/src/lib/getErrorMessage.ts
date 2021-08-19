import { KeystoneContext } from '@keystone-next/keystone/types';
import {
  AuthTokenRedemptionErrorCode,
  AuthTokenRequestErrorCode,
  PasswordAuthErrorCode,
} from '../types';

export function getPasswordAuthError({
  identityField,
  secretField,
  code,
  listKey,
  context,
}: {
  identityField: string;
  secretField: string;
  code: PasswordAuthErrorCode;
  listKey: string;
  context: KeystoneContext;
}): string {
  switch (code) {
    case 'FAILURE':
      return 'Authentication failed.';
    case 'IDENTITY_NOT_FOUND':
      return `The ${identityField} value provided didn't identify any ${context
        .gqlNames(listKey)
        .listQueryName.replace('all', '')}.`;
    case 'SECRET_NOT_SET':
      return `The ${
        context.gqlNames(listKey).outputTypeName
      } identified has no ${secretField} set so can not be authenticated.`;
    case 'MULTIPLE_IDENTITY_MATCHES':
      return `The ${identityField} value provided identified more than one ${
        context.gqlNames(listKey).outputTypeName
      }.`;
    case 'SECRET_MISMATCH':
      return `The ${secretField} provided is incorrect.`;
  }
}

export function getAuthTokenErrorMessage({
  identityField,
  code,
  listKey,
  context,
}: {
  identityField: string;
  code: AuthTokenRedemptionErrorCode | AuthTokenRequestErrorCode;
  listKey: string;
  context: KeystoneContext;
}): string {
  switch (code) {
    case 'FAILURE':
      return 'Auth token redemption failed.';
    case 'IDENTITY_NOT_FOUND':
      return `The ${identityField} value provided didn't identify any ${context
        .gqlNames(listKey)
        .listQueryName.replace('all', '')}.`;
    case 'MULTIPLE_IDENTITY_MATCHES':
      return `The ${identityField} value provided identified more than one ${
        context.gqlNames(listKey).outputTypeName
      }.`;
    case 'TOKEN_NOT_SET':
      return `The ${
        context.gqlNames(listKey).outputTypeName
      } identified has no auth token of this type set.`;
    case 'TOKEN_MISMATCH':
      return 'The auth token provided is incorrect.';
    case 'TOKEN_EXPIRED':
      return 'The auth token provided has expired.';
    case 'TOKEN_REDEEMED':
      return 'Auth tokens are single use and the auth token provided has already been redeemed.';
  }
}
