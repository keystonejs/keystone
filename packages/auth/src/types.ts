import { BaseGeneratedListTypes, KeystoneContext } from '@keystone-next/keystone/types';

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
  context: KeystoneContext;
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
  /** The initial user/db seeding functionality */
  initFirstItem?: InitFirstItemConfig<GeneratedListTypes>;
  /** Password reset link functionality */
  passwordResetLink?: AuthTokenTypeConfig;
  /** "Magic link" functionality */
  magicAuthLink?: AuthTokenTypeConfig;
  /** Session data population */
  sessionData?: string;
};

export type InitFirstItemConfig<GeneratedListTypes extends BaseGeneratedListTypes> = {
  /** Array of fields to collect, e.g ['name', 'email', 'password'] */
  fields: readonly GeneratedListTypes['fields'][];
  /** Suppresses the second screen where we ask people to subscribe and follow Keystone */
  skipKeystoneWelcome?: boolean;
  /** Extra input to add for the create mutation */
  itemData?: Partial<GeneratedListTypes['inputs']['create']>;
};

export type AuthTokenRedemptionErrorCode = 'FAILURE' | 'TOKEN_EXPIRED' | 'TOKEN_REDEEMED';

export type SecretFieldImpl = {
  generateHash: (secret: string) => Promise<string>;
  compare: (secret: string, hash: string) => Promise<string>;
};
