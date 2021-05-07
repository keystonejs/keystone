import url from 'url';
import {
  AdminFileToWrite,
  BaseGeneratedListTypes,
  KeystoneConfig,
  KeystoneContext,
  AdminUIConfig,
} from '@keystone-next/types';
import { password, timestamp } from '@keystone-next/fields';

import { AuthConfig, AuthGqlNames } from './types';
import { getSchemaExtension } from './schema';
import { signinTemplate } from './templates/signin';
import { initTemplate } from './templates/init';

/**
 * createAuth function
 *
 * Generates config for Keystone to implement standard auth features.
 */
export function createAuth<GeneratedListTypes extends BaseGeneratedListTypes>({
  listKey,
  secretField,
  initFirstItem,
  identityField,
  magicAuthLink,
  passwordResetLink,
}: AuthConfig<GeneratedListTypes>) {
  // The protectIdentities flag is currently under review to see whether it should be
  // part of the createAuth API (in which case its use cases need to be documented and tested)
  // or whether always being true is what we want, in which case we can refactor our code
  // to match this. -TL
  const protectIdentities = true;
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
   * pageMiddleware
   *
   * Should be added to the ui.pageMiddleware stack.
   *
   * Redirects:
   *  - from the signin or init pages to the index when a valid session is present
   *  - to the init page when initFirstItem is configured, and there are no user in the database
   *  - to the signin page when no valid session is present
   */
  const pageMiddleware: AdminUIConfig['pageMiddleware'] = async ({
    req,
    isValidSession,
    createContext,
    session,
  }) => {
    const pathname = url.parse(req.url!).pathname!;

    if (isValidSession) {
      if (pathname === '/signin' || (initFirstItem && pathname === '/init')) {
        return { kind: 'redirect', to: '/' };
      }
      return;
    }

    if (!session && initFirstItem) {
      const count = await createContext({}).sudo().lists[listKey].count({});
      if (count === 0) {
        if (pathname !== '/init') {
          return { kind: 'redirect', to: '/init' };
        }
        return;
      }
    }

    if (!session && pathname !== '/signin') {
      return { kind: 'redirect', to: `/signin?from=${encodeURIComponent(req.url!)}` };
    }
  };

  /**
   * getAdditionalFiles
   *
   * This function adds files to be generated into the Admin UI build. Must be added to the
   * ui.getAdditionalFiles config.
   *
   * The signin page is always included, and the init page is included when initFirstItem is set
   */
  const getAdditionalFiles = () => {
    let filesToWrite: AdminFileToWrite[] = [
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
  const publicPages = ['/signin'];
  if (initFirstItem) {
    publicPages.push('/init');
  }

  /**
   * extendGraphqlSchema
   *
   * Must be added to the extendGraphqlSchema config. Can be composed.
   */
  const extendGraphqlSchema = getSchemaExtension({
    identityField,
    listKey,
    protectIdentities,
    secretField,
    gqlNames,
    initFirstItem,
    passwordResetLink,
    magicAuthLink,
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

    // FIXME: Until we explicity support user defined field types, should we just check against .type.type === 'Password'?
    const { type } = secretFieldConfig;
    const secretPrototype = type && type.implementation && type.implementation.prototype;
    const secretTypename = type && type.type;
    if (typeof secretPrototype.compare !== 'function' || secretPrototype.compare.length < 2) {
      const s = JSON.stringify(secretField);
      const st = JSON.stringify(secretTypename);
      let msg = `A createAuth() invocation for the "${listKey}" list specifies ${s} as its secretField, which uses the field type ${st}. But the ${st} field type doesn't implement the required compare() functionality.`;
      if (secretTypename !== 'Password') {
        msg += ` Did you mean to reference a field of type Password instead?`;
      }
      throw new Error(msg);
    }

    // Ditto here, just explicitly enforce the use of our `password` field.
    if (typeof secretPrototype.generateHash !== 'function') {
      const s = JSON.stringify(secretField);
      const st = JSON.stringify(secretTypename);
      let msg = `A createAuth() invocation for the "${listKey}" list specifies ${s} as its secretField, which uses the field type ${st}. But the ${st} field type doesn't implement the required generateHash() functionality.`;
      if (secretTypename !== 'Password') {
        msg += ` Did you mean to reference a field of type Password instead?`;
      }
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
   * withAuth
   *
   * Automatically extends config with the correct auth functionality. This is the easiest way to
   * configure auth for keystone; you should probably use it unless you want to extend or replace
   * the way auth is set up with custom functionality.
   *
   * It validates the auth config against the provided keystone config, and preserves existing
   * config by composing existing extendGraphqlSchema functions and ui config.
   */
  const withAuth = (keystoneConfig: KeystoneConfig): KeystoneConfig => {
    validateConfig(keystoneConfig);
    let ui = keystoneConfig.ui;
    if (!keystoneConfig.ui?.isDisabled) {
      ui = {
        ...keystoneConfig.ui,
        publicPages: [...(keystoneConfig.ui?.publicPages || []), ...publicPages],
        getAdditionalFiles: [...(keystoneConfig.ui?.getAdditionalFiles || []), getAdditionalFiles],
        pageMiddleware: async args =>
          (await pageMiddleware(args)) ?? keystoneConfig?.ui?.pageMiddleware?.(args),
        enableSessionItem: true,
        isAccessAllowed: async (context: KeystoneContext) => {
          // Allow access to the adminMeta data from the /init path to correctly render that page
          // even if the user isn't logged in (which should always be the case if they're seeing /init)
          const headers = context.req?.headers;
          const host = headers ? headers['x-forwarded-host'] || headers['host'] : null;
          const url = headers?.referer ? new URL(headers.referer) : undefined;
          const accessingInitPage =
            url?.pathname === '/init' &&
            url?.host === host &&
            (await context.sudo().lists[listKey].count({})) === 0;
          return (
            accessingInitPage ||
            (keystoneConfig.ui?.isAccessAllowed
              ? keystoneConfig.ui.isAccessAllowed(context)
              : context.session !== undefined)
          );
        },
      };
    }
    const existingExtendGraphQLSchema = keystoneConfig.extendGraphqlSchema;
    const listConfig = keystoneConfig.lists[listKey];
    return {
      ...keystoneConfig,
      ui,
      // Add the additional fields to the references lists fields object
      // TODO: The fields we're adding here shouldn't naively replace existing fields with the same key
      // Leaving existing fields in place would allow solution devs to customise these field defs (eg. access control,
      // work factor for the tokens, etc.) without abandoning the withAuth() interface
      lists: {
        ...keystoneConfig.lists,
        [listKey]: { ...listConfig, fields: { ...listConfig.fields, ...fields } },
      },
      extendGraphqlSchema: existingExtendGraphQLSchema
        ? (schema, keystone) =>
            existingExtendGraphQLSchema(extendGraphqlSchema(schema, keystone), keystone)
        : extendGraphqlSchema,
    };
  };

  return {
    withAuth,
    // In the future we may want to return the following so that developers can
    // roll their own. This is pending a review of the use cases this might be
    // appropriate for, along with documentation and testing.
    // ui: { enableSessionItem: true, pageMiddleware, getAdditionalFiles, publicPages },
    // fields,
    // extendGraphqlSchema,
    // validateConfig,
  };
}
