import {
  AdminFileToWrite,
  BaseListTypeInfo,
  KeystoneConfig,
  KeystoneContext,
  SessionStrategy,
  BaseKeystoneTypeInfo,
} from '@keystone-6/core/types';
import { password, timestamp } from '@keystone-6/core/fields';

import { AuthConfig, AuthGqlNames } from './types';
import { getSchemaExtension } from './schema';
import { signinTemplate } from './templates/signin';
import { initTemplate } from './templates/init';

/**
 * createAuth function
 *
 * Generates config for Keystone to implement standard auth features.
 */
export function createAuth<ListTypeInfo extends BaseListTypeInfo>({
  listKey,
  secretField,
  initFirstItem,
  identityField,
  magicAuthLink,
  passwordResetLink,
  sessionData = 'id',
}: AuthConfig<ListTypeInfo>) {
  const gqlNames: AuthGqlNames = {
    // Core
    authenticateItemWithPassword: `authenticate${listKey}WithPassword`,
    ItemAuthenticationWithPasswordResult: `${listKey}AuthenticationWithPasswordResult`,
    ItemAuthenticationWithPasswordSuccess: `${listKey}AuthenticationWithPasswordSuccess`,
    ItemAuthenticationWithPasswordFailure: `${listKey}AuthenticationWithPasswordFailure`,
    // Initial data
    CreateInitialInput: `CreateInitial${listKey}Input`,
    createInitialItem: `createInitial${listKey}`,
    // Password reset
    sendItemPasswordResetLink: `send${listKey}PasswordResetLink`,
    SendItemPasswordResetLinkResult: `Send${listKey}PasswordResetLinkResult`,
    validateItemPasswordResetToken: `validate${listKey}PasswordResetToken`,
    ValidateItemPasswordResetTokenResult: `Validate${listKey}PasswordResetTokenResult`,
    redeemItemPasswordResetToken: `redeem${listKey}PasswordResetToken`,
    RedeemItemPasswordResetTokenResult: `Redeem${listKey}PasswordResetTokenResult`,
    // Magic auth
    sendItemMagicAuthLink: `send${listKey}MagicAuthLink`,
    SendItemMagicAuthLinkResult: `Send${listKey}MagicAuthLinkResult`,
    redeemItemMagicAuthToken: `redeem${listKey}MagicAuthToken`,
    RedeemItemMagicAuthTokenResult: `Redeem${listKey}MagicAuthTokenResult`,
    RedeemItemMagicAuthTokenSuccess: `Redeem${listKey}MagicAuthTokenSuccess`,
    RedeemItemMagicAuthTokenFailure: `Redeem${listKey}MagicAuthTokenFailure`,
  };

  /**
   * fields
   *
   * Fields added to the auth list.
   */
  const fieldConfig = {
    access: () => false,
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'hidden' },
      listView: { fieldMode: 'hidden' },
    },
  } as const;
  // These field names have to follow this format so that for e.g
  // validateAuthToken() behaves correctly.
  const tokenFields = (tokenType: 'passwordReset' | 'magicAuth') => ({
    [`${tokenType}Token`]: password({ ...fieldConfig }),
    [`${tokenType}IssuedAt`]: timestamp({ ...fieldConfig }),
    [`${tokenType}RedeemedAt`]: timestamp({ ...fieldConfig }),
  });
  const fields = {
    ...(passwordResetLink && tokenFields('passwordReset')),
    ...(magicAuthLink && tokenFields('magicAuth')),
  };

  /**
   * getAdditionalFiles
   *
   * This function adds files to be generated into the Admin UI build. Must be added to the
   * ui.getAdditionalFiles config.
   *
   * The signin page is always included, and the init page is included when initFirstItem is set
   */
  const authGetAdditionalFiles = () => {
    const filesToWrite: AdminFileToWrite[] = [
      {
        mode: 'write',
        src: signinTemplate({ gqlNames, identityField, secretField }),
        outputPath: 'pages/signin.js',
      },
    ];
    if (initFirstItem) {
      filesToWrite.push({
        mode: 'write',
        src: initTemplate({ listKey, initFirstItem }),
        outputPath: 'pages/init.js',
      });
    }
    return filesToWrite;
  };

  /**
   * publicAuthPages
   *
   * Must be added to the ui.publicPages config
   */
  const authPublicPages = ['/signin'];

  /**
   * extendGraphqlSchema
   *
   * Must be added to the extendGraphqlSchema config. Can be composed.
   */
  const extendGraphqlSchema = getSchemaExtension({
    identityField,
    listKey,
    secretField,
    gqlNames,
    initFirstItem,
    passwordResetLink,
    magicAuthLink,
    sessionData,
  });

  /**
   * validateConfig
   *
   * Validates the provided auth config; optional step when integrating auth
   */
  const validateConfig = (keystoneConfig: KeystoneConfig) => {
    const listConfig = keystoneConfig.lists[listKey];
    if (listConfig === undefined) {
      const msg = `A createAuth() invocation specifies the list "${listKey}" but no list with that key has been defined.`;
      throw new Error(msg);
    }

    // TODO: Check for String-like typing for identityField? How?
    // TODO: Validate that the identifyField is unique.
    // TODO: If this field isn't required, what happens if I try to log in as `null`?
    const identityFieldConfig = listConfig.fields[identityField];
    if (identityFieldConfig === undefined) {
      const i = JSON.stringify(identityField);
      const msg = `A createAuth() invocation for the "${listKey}" list specifies ${i} as its identityField but no field with that key exists on the list.`;
      throw new Error(msg);
    }

    // TODO: We could make the secret field optional to disable the standard id/secret auth and password resets (ie. magic links only)
    const secretFieldConfig = listConfig.fields[secretField];
    if (secretFieldConfig === undefined) {
      const s = JSON.stringify(secretField);
      const msg = `A createAuth() invocation for the "${listKey}" list specifies ${s} as its secretField but no field with that key exists on the list.`;
      throw new Error(msg);
    }

    // TODO: Could also validate initFirstItem.itemData keys?
    for (const field of initFirstItem?.fields || []) {
      if (listConfig.fields[field] === undefined) {
        const f = JSON.stringify(field);
        const msg = `A createAuth() invocation for the "${listKey}" list specifies the field ${f} in initFirstItem.fields array but no field with that key exist on the list.`;
        throw new Error(msg);
      }
    }
  };

  /**
   * withItemData
   *
   * Automatically injects a session.data value with the authenticated item
   */
  const withItemData = (
    _sessionStrategy: SessionStrategy<Record<string, any>>
  ): SessionStrategy<{ listKey: string; itemId: string; data: any }> => {
    const { get, ...sessionStrategy } = _sessionStrategy;
    return {
      ...sessionStrategy,
      get: async ({ context }) => {
        const session = await get({ context });
        const sudoContext = context.sudo();
        if (
          !session ||
          !session.listKey ||
          session.listKey !== listKey ||
          !session.itemId ||
          !sudoContext.query[session.listKey]
        ) {
          return;
        }

        try {
          const data = await sudoContext.query[listKey].findOne({
            where: { id: session.itemId },
            query: sessionData,
          });
          if (!data) return;

          return { ...session, itemId: session.itemId, listKey, data };
        } catch (e) {
          // TODO: the assumption is this should only be from an invalid sessionData configuration
          //   it could be something else though, either way, result is a bad session
          return;
        }
      },
    };
  };

  async function hasInitFirstItemConditions(context: KeystoneContext) {
    // do nothing if they aren't using this feature
    if (!initFirstItem) return false;

    // if they have a session, there is no initialisation necessary
    if (context.session) return false;

    const count = await context.sudo().db[listKey].count({});
    return count === 0;
  }

  async function authMiddleware({
    context,
    isValidSession: wasAccessAllowed,
  }: {
    context: KeystoneContext;
    isValidSession: boolean; // TODO: rename "isValidSession" to "wasAccessAllowed"?
  }): Promise<{ kind: 'redirect'; to: string } | void> {
    const { req } = context;
    const { pathname } = new URL(req!.url!, 'http://_');

    // redirect to init if initFirstItem conditions are met
    if (pathname !== '/init' && (await hasInitFirstItemConditions(context))) {
      return { kind: 'redirect', to: '/init' };
    }

    // redirect to / if attempting to /init and initFirstItem conditions are not met
    if (pathname === '/init' && !(await hasInitFirstItemConditions(context))) {
      return { kind: 'redirect', to: '/' };
    }

    // don't redirect if we have access
    if (wasAccessAllowed) return;

    // otherwise, redirect to signin
    if (pathname === '/') return { kind: 'redirect', to: '/signin' };
    return {
      kind: 'redirect',
      to: `/signin?from=${encodeURIComponent(req!.url!)}`,
    };
  }

  function defaultIsAccessAllowed({ session, sessionStrategy }: KeystoneContext) {
    return session !== undefined;
  }

  /**
   * withAuth
   *
   * Automatically extends your configuration with a prescriptive implementation.
   */
  const withAuth = <TypeInfo extends BaseKeystoneTypeInfo>(
    keystoneConfig: KeystoneConfig<TypeInfo>
  ): KeystoneConfig<TypeInfo> => {
    validateConfig(keystoneConfig);

    let { ui } = keystoneConfig;
    if (!ui?.isDisabled) {
      const {
        getAdditionalFiles = [],
        isAccessAllowed = defaultIsAccessAllowed,
        pageMiddleware,
        publicPages = [],
      } = ui || {};
      ui = {
        ...ui,
        publicPages: [...publicPages, ...authPublicPages],
        getAdditionalFiles: [...getAdditionalFiles, authGetAdditionalFiles],

        isAccessAllowed: async (context: KeystoneContext) => {
          if (await hasInitFirstItemConditions(context)) return true;
          return isAccessAllowed(context);
        },

        pageMiddleware: async args => {
          const shouldRedirect = await authMiddleware(args);
          if (shouldRedirect) return shouldRedirect;
          return pageMiddleware?.(args);
        },
      };
    }

    if (!keystoneConfig.session) throw new TypeError('Missing .session configuration');
    const session = withItemData(keystoneConfig.session);

    const existingExtendGraphQLSchema = keystoneConfig.extendGraphqlSchema;
    const listConfig = keystoneConfig.lists[listKey];
    return {
      ...keystoneConfig,
      ui,
      session,
      lists: {
        ...keystoneConfig.lists,
        [listKey]: { ...listConfig, fields: { ...listConfig.fields, ...fields } },
      },
      extendGraphqlSchema: existingExtendGraphQLSchema
        ? schema => existingExtendGraphQLSchema(extendGraphqlSchema(schema))
        : extendGraphqlSchema,
    };
  };

  return {
    withAuth,
  };
}
