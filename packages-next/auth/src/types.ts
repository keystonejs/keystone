import { BaseGeneratedListTypes, KeystoneAdminConfig, KeystoneConfig } from '@keystone-next/types';

export type AuthGqlNames = {
  CreateInitialInput: string;
  createInitialItem: string;
  authenticateItemWithPassword: string;
  ItemAuthenticationWithPasswordResult: string;
  ItemAuthenticationWithPasswordSuccess: string;
  ItemAuthenticationWithPasswordFailure: string;
  sendItemPasswordResetLink: string;
  SendItemPasswordResetLinkResult: string;
  validateItemPasswordResetToken: string;
  ValidateItemPasswordResetTokenResult: string;
  redeemItemPasswordResetToken: string;
  RedeemItemPasswordResetTokenResult: string;
  sendItemMagicAuthLink: string;
  SendItemMagicAuthLinkResult: string;
  redeemItemMagicAuthToken: string;
  RedeemItemMagicAuthTokenResult: string;
  RedeemItemMagicAuthTokenSuccess: string;
  RedeemItemMagicAuthTokenFailure: string;
};

export type SendTokenFn = (args: {
  itemId: string | number;
  identity: string;
  token: string;
}) => Promise<void> | void;

export type AuthTokenTypeConfig = {
  /** Called when a user should be sent the magic signin token they requested */
  sendToken: SendTokenFn;
  /** How long do tokens stay valid for from time of issue, in minutes **/
  tokensValidForMins?: number;
};

export type AuthConfig<GeneratedListTypes extends BaseGeneratedListTypes> = {
  /** The key of the list to authenticate users with */
  listKey: GeneratedListTypes['key'];
  /** The path of the field the identity is stored in; must be text-ish */
  identityField: GeneratedListTypes['fields'];
  /** The path of the field the secret is stored in; must be password-ish */
  secretField: GeneratedListTypes['fields'];
  /** Attempts to prevent consumers of the API from being able to determine the value of identity fields */
  protectIdentities?: boolean;
  /** Password reset link functionality */
  passwordResetLink?: AuthTokenTypeConfig;
  /** "Magic link" functionality */
  magicAuthLink?: AuthTokenTypeConfig;
  /** The initial user/db seeding functionality */
  initFirstItem?: {
    /** Array of fields to collect, e.g ['name', 'email', 'password'] */
    fields: GeneratedListTypes['fields'][];
    /** Suppresses the second screen where we ask people to subscribe and follow Keystone */
    skipKeystoneSignup?: boolean;
    /** Extra input to add for the create mutation */
    itemData?: Partial<GeneratedListTypes['inputs']['create']>;
  };
  /** A string added GraphQL names created by this package; can be used to support multiple sets of auth functionality */
  gqlSuffix?: string;
};

export type Auth = {
  admin: {
    enableSessionItem: NonNullable<KeystoneAdminConfig['enableSessionItem']>;
    publicPages: NonNullable<KeystoneAdminConfig['publicPages']>;
    pageMiddleware: NonNullable<KeystoneAdminConfig['pageMiddleware']>;
    getAdditionalFiles: NonNullable<KeystoneAdminConfig['getAdditionalFiles']>[number];
  };
  extendGraphqlSchema: NonNullable<KeystoneConfig['extendGraphqlSchema']>;
  fields: { [prop: string]: any };
  validateConfig: (keystoneConfig: KeystoneConfig) => void;
  withAuth: (config: KeystoneConfig) => KeystoneConfig;
};

export type AuthErrorCode =
  // Password authentication
  | 'PASSWORD_AUTH_FAILURE' // Generic
  | 'PASSWORD_AUTH_IDENTITY_NOT_FOUND'
  | 'PASSWORD_AUTH_SECRET_NOT_SET'
  | 'PASSWORD_AUTH_MULTIPLE_IDENTITY_MATCHES'
  | 'PASSWORD_AUTH_SECRET_MISMATCH'
  // Password resets and magic links
  | 'AUTH_TOKEN_REQUEST_IDENTITY_NOT_FOUND'
  | 'AUTH_TOKEN_REQUEST_MULTIPLE_IDENTITY_MATCHES'
  | 'AUTH_TOKEN_REDEMPTION_FAILURE' // Generic
  | 'AUTH_TOKEN_REDEMPTION_IDENTITY_NOT_FOUND'
  | 'AUTH_TOKEN_REDEMPTION_MULTIPLE_IDENTITY_MATCHES'
  | 'AUTH_TOKEN_REDEMPTION_TOKEN_NOT_SET'
  | 'AUTH_TOKEN_REDEMPTION_TOKEN_MISMATCH'
  | 'AUTH_TOKEN_REDEMPTION_TOKEN_EXPIRED'
  | 'AUTH_TOKEN_REDEMPTION_TOKEN_REDEEMED'
  // Bad times
  | 'INTERNAL_ERROR'
  // Not used by the auth package itself
  // Allows custom logic/errors to be generated without replacing the gql output types
  | 'CUSTOM_ERROR';
