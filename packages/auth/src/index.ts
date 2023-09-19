import type {
  AdminFileToWrite,
  BaseListTypeInfo,
  KeystoneConfig,
  KeystoneContext,
  BaseKeystoneTypeInfo,
} from '@keystone-6/core/types';
import { password, timestamp } from '@keystone-6/core/fields';

import type { AuthConfig, AuthGqlNames, SessionStrategy } from './types';
import { getSchemaExtension } from './schema';
import { signinTemplate } from './templates/signin';
import { initTemplate } from './templates/init';

export type AuthSession = {
  listKey: string; // TODO: use ListTypeInfo
  itemId: string | number; // TODO: use ListTypeInfo
  data: unknown; // TODO: use ListTypeInfo
};

// TODO: use TypeInfo and listKey for types
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
  sessionStrategy,
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

  const authFields = {
    ...(passwordResetLink
      ? {
          passwordResetToken: password({ ...fieldConfig }),
          passwordResetIssuedAt: timestamp({ ...fieldConfig }),
          passwordResetRedeemedAt: timestamp({ ...fieldConfig }),
        }
      : null),

    ...(magicAuthLink
      ? {
          magicAuthToken: password({ ...fieldConfig }),
          magicAuthIssuedAt: timestamp({ ...fieldConfig }),
          magicAuthRedeemedAt: timestamp({ ...fieldConfig }),
        }
      : null),
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
   * extendGraphqlSchema
   *
   * Must be added to the extendGraphqlSchema config. Can be composed.
   */
  const authExtendGraphqlSchema = getSchemaExtension({
    identityField,
    listKey,
    secretField,
    gqlNames,
    initFirstItem,
    passwordResetLink,
    magicAuthLink,
    sessionStrategy,
  });

  function throwIfInvalidConfig<TypeInfo extends BaseKeystoneTypeInfo>(
    config: KeystoneConfig<TypeInfo>
  ) {
    if (!(listKey in config.lists)) {
      throw new Error(`withAuth cannot find the list "${listKey}"`);
    }

    // TODO: verify that the identity field is unique
    // TODO: verify that the field is required
    const list = config.lists[listKey];
    if (!(identityField in list.fields)) {
      throw new Error(`withAuth cannot find the identity field "${listKey}.${identityField}"`);
    }

    if (!(secretField in list.fields)) {
      throw new Error(`withAuth cannot find the secret field "${listKey}.${secretField}"`);
    }

    for (const fieldKey of initFirstItem?.fields || []) {
      if (fieldKey in list.fields) continue;
    }
  }
  /**
   * withItemData
   *
   * Automatically injects a session.data value with the authenticated item
   */
  const withItemData = (
    sessionStrategy: SessionStrategy<Record<string, any>>,
    getSession: KeystoneConfig['getSession']
  ): ((args: { context: KeystoneContext }) => Promise<unknown | undefined>) => {
    const { get } = sessionStrategy;
    return async ({ context }) => {
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
          query: sessionStrategy.data,
        });
        if (!data) return;
        if (getSession) {
          return getSession({ context: { ...context, session: { ...session, data } } });
        } else {
          return { ...session, itemId: session.itemId, listKey, data };
        }
      } catch (e) {
        console.error(e);
        // TODO: the assumption is this could only be from an invalid sessionData configuration
        //   it could be something else though, either way, result is a bad session
        return;
      }
    };
  };

  async function hasInitFirstItemConditions<TypeInfo extends BaseKeystoneTypeInfo>(
    context: KeystoneContext<TypeInfo>
  ) {
    // do nothing if they aren't using this feature
    if (!initFirstItem) return false;

    // if they have a session, there is no initialisation necessary
    if (context.session) return false;

    const count = await context.sudo().db[listKey].count({});
    return count === 0;
  }

  async function authMiddleware<TypeInfo extends BaseKeystoneTypeInfo>({
    context,
    wasAccessAllowed,
    basePath,
  }: {
    context: KeystoneContext<TypeInfo>;
    wasAccessAllowed: boolean;
    basePath: string;
  }): Promise<{ kind: 'redirect'; to: string } | void> {
    const { req } = context;
    const { pathname } = new URL(req!.url!, 'http://_');

    // redirect to init if initFirstItem conditions are met
    if (pathname !== `${basePath}/init` && (await hasInitFirstItemConditions(context))) {
      return { kind: 'redirect', to: `${basePath}/init` };
    }

    // redirect to / if attempting to /init and initFirstItem conditions are not met
    if (pathname === `${basePath}/init` && !(await hasInitFirstItemConditions(context))) {
      return { kind: 'redirect', to: basePath };
    }

    // don't redirect if we have access
    if (wasAccessAllowed) return;

    // otherwise, redirect to signin
    return { kind: 'redirect', to: `${basePath}/signin` };
  }

  function defaultIsAccessAllowed({ session }: KeystoneContext) {
    return session !== undefined;
  }

  function defaultExtendGraphqlSchema<T>(schema: T) {
    return schema;
  }

  /**
   * withAuth
   *
   * Automatically extends your configuration with a prescriptive implementation.
   */
  function withAuth<TypeInfo extends BaseKeystoneTypeInfo>(
    config: KeystoneConfig<TypeInfo>
  ): KeystoneConfig<TypeInfo> {
    throwIfInvalidConfig(config);
    let { ui } = config;
    if (!ui?.isDisabled) {
      const {
        getAdditionalFiles = [],
        isAccessAllowed = defaultIsAccessAllowed,
        pageMiddleware,
        publicPages = [],
      } = ui || {};
      const authPublicPages = [`${ui?.basePath ?? ''}/signin`];
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

    const getSession = withItemData(sessionStrategy, config.getSession);

    const { extendGraphqlSchema = defaultExtendGraphqlSchema } = config;
    const authListConfig = config.lists[listKey];

    return {
      ...config,
      ui,
      getSession,
      lists: {
        ...config.lists,
        [listKey]: {
          ...authListConfig,
          fields: {
            ...authListConfig.fields,
            ...authFields,
          },
        },
      },
      extendGraphqlSchema: schema => {
        return extendGraphqlSchema(authExtendGraphqlSchema(schema));
      },
    };
  }

  return {
    withAuth,
  };
}
