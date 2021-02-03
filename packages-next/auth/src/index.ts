import url from 'url';
import { mergeSchemas } from '@graphql-tools/merge';
import {
  AdminFileToWrite,
  BaseGeneratedListTypes,
  KeystoneConfig,
  ExtendGraphqlSchema,
} from '@keystone-next/types';
import { password, timestamp } from '@keystone-next/fields';

import { AuthConfig, Auth, AuthGqlNames, AuthTokenTypeConfig } from './types';

import { getBaseAuthSchema } from './gql/getBaseAuthSchema';
import { getInitFirstItemSchema } from './gql/getInitFirstItemSchema';
import { getPasswordResetSchema } from './gql/getPasswordResetSchema';
import { getMagicAuthLinkSchema } from './gql/getMagicAuthLinkSchema';

import { signinTemplate } from './templates/signin';
import { initTemplate } from './templates/init';
import { KeystoneContext } from '@keystone-next/types/src/core';

const getSchemaExtension = ({
  identityField,
  listKey,
  protectIdentities,
  secretField,
  gqlNames,
  initFirstItem,
  passwordResetLink,
  magicAuthLink,
}: {
  identityField: string;
  listKey: string;
  protectIdentities: boolean;
  secretField: string;
  gqlNames: AuthGqlNames;
  initFirstItem?: any;
  passwordResetLink?: any;
  magicAuthLink?: AuthTokenTypeConfig;
}): ExtendGraphqlSchema => (schema, keystone) =>
  [
    getBaseAuthSchema({
      identityField,
      listKey,
      protectIdentities,
      secretField,
      gqlNames,
    }),
    initFirstItem &&
      getInitFirstItemSchema({
        listKey,
        fields: initFirstItem.fields,
        itemData: initFirstItem.itemData,
        gqlNames,
        keystone,
      }),
    passwordResetLink &&
      getPasswordResetSchema({
        identityField,
        listKey,
        protectIdentities,
        secretField,
        passwordResetLink,
        gqlNames,
      }),
    magicAuthLink &&
      getMagicAuthLinkSchema({
        identityField,
        listKey,
        protectIdentities,
        magicAuthLink,
        gqlNames,
      }),
  ]
    .filter(x => x)
    .reduce((s, extension) => mergeSchemas({ schemas: [s], ...extension }), schema);

/**
 * createAuth function
 *
 * Generates config for Keystone to implement standard auth features.
 */
export function createAuth<GeneratedListTypes extends BaseGeneratedListTypes>({
  listKey,
  secretField,
  protectIdentities = true,
  gqlSuffix = '',
  initFirstItem,
  identityField,
  magicAuthLink,
  passwordResetLink,
}: AuthConfig<GeneratedListTypes>): Auth {
  const gqlNames: AuthGqlNames = {
    CreateInitialInput: `CreateInitial${listKey}Input${gqlSuffix}`,
    createInitialItem: `createInitial${listKey}${gqlSuffix}`,
    authenticateItemWithPassword: `authenticate${listKey}WithPassword${gqlSuffix}`,
    ItemAuthenticationWithPasswordResult: `${listKey}AuthenticationWithPasswordResult${gqlSuffix}`,
    ItemAuthenticationWithPasswordSuccess: `${listKey}AuthenticationWithPasswordSuccess${gqlSuffix}`,
    ItemAuthenticationWithPasswordFailure: `${listKey}AuthenticationWithPasswordFailure${gqlSuffix}`,
    sendItemPasswordResetLink: `send${listKey}PasswordResetLink${gqlSuffix}`,
    SendItemPasswordResetLinkResult: `Send${listKey}PasswordResetLinkResult${gqlSuffix}`,
    validateItemPasswordResetToken: `validate${listKey}PasswordResetToken${gqlSuffix}`,
    ValidateItemPasswordResetTokenResult: `Validate${listKey}PasswordResetTokenResult${gqlSuffix}`,
    redeemItemPasswordResetToken: `redeem${listKey}PasswordResetToken${gqlSuffix}`,
    RedeemItemPasswordResetTokenResult: `Redeem${listKey}PasswordResetTokenResult${gqlSuffix}`,
    sendItemMagicAuthLink: `send${listKey}MagicAuthLink${gqlSuffix}`,
    SendItemMagicAuthLinkResult: `Send${listKey}MagicAuthLinkResult${gqlSuffix}`,
    redeemItemMagicAuthToken: `redeem${listKey}MagicAuthToken${gqlSuffix}`,
    RedeemItemMagicAuthTokenResult: `Redeem${listKey}MagicAuthTokenResult${gqlSuffix}`,
    RedeemItemMagicAuthTokenSuccess: `Redeem${listKey}MagicAuthTokenSuccess${gqlSuffix}`,
    RedeemItemMagicAuthTokenFailure: `Redeem${listKey}MagicAuthTokenFailure${gqlSuffix}`,
  };

  // Fields added to the auth list

  // TODO: These access control settings are not static, because we're still using executGraphQL
  // internally and stataic false excludes them from the schema. When the implementation is
  // updated to use our crud API, we can set these to static false values.
  const fieldConfig = {
    access: () => false,
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'hidden' },
      listView: { fieldMode: 'hidden' },
    },
  } as const;

  const additionalListFields = {
    [`${secretField}ResetToken`]: password({ ...fieldConfig }),
    [`${secretField}ResetIssuedAt`]: timestamp({ ...fieldConfig }),
    [`${secretField}ResetRedeemedAt`]: timestamp({ ...fieldConfig }),
    [`magicAuthToken`]: password({ ...fieldConfig }),
    [`magicAuthIssuedAt`]: timestamp({ ...fieldConfig }),
    [`magicAuthRedeemedAt`]: timestamp({ ...fieldConfig }),
  };

  /**
   * adminPageMiddleware
   *
   * Should be added to the ui.pageMiddleware stack.
   *
   * Redirects:
   *  - from the signin or init pages to the index when a valid session is present
   *  - to the init page when initFirstItem is configured, and there are no user in the database
   *  - to the signin page when no valid session is present
   */
  const adminPageMiddleware: Auth['ui']['pageMiddleware'] = async ({
    req,
    isValidSession,
    createContext,
    session,
  }) => {
    const pathname = url.parse(req.url!).pathname!;

    if (isValidSession) {
      if (pathname === '/signin' || (initFirstItem && pathname === '/init')) {
        return {
          kind: 'redirect',
          to: '/',
        };
      }
      return;
    }

    if (!session && initFirstItem) {
      const count = await createContext({ skipAccessControl: true }).lists[listKey].count({});
      if (count === 0) {
        if (pathname !== '/init') {
          return {
            kind: 'redirect',
            to: '/init',
          };
        }
        return;
      }
    }

    if (!session && pathname !== '/signin') {
      return {
        kind: 'redirect',
        to: `/signin?from=${encodeURIComponent(req.url!)}`,
      };
    }
  };

  /**
   * additionalFiles
   *
   * This function adds files to be generated into the Admin UI build. Must be added to the
   * ui.additionalFiles config.
   *
   * The signin page is always included, and the init page is included when initFirstItem is set
   */
  const additionalFiles: Auth['ui']['getAdditionalFiles'] = () => {
    let filesToWrite: AdminFileToWrite[] = [
      {
        mode: 'write',
        outputPath: 'pages/signin.js',
        src: signinTemplate({ gqlNames, identityField, secretField }),
      },
    ];
    if (initFirstItem) {
      filesToWrite.push({
        mode: 'write',
        outputPath: 'pages/init.js',
        // wonder what this template expects from config...
        src: initTemplate({ listKey, initFirstItem }),
      });
    }
    return filesToWrite;
  };

  /**
   * publicAuthPages
   *
   * Must be added to the ui.publicPages config
   */
  const publicAuthPages = ['/signin', '/init'];

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
    const specifiedListConfig = keystoneConfig.lists[listKey];
    if (keystoneConfig.lists[listKey] === undefined) {
      throw new Error(
        `A createAuth() invocation specifies the list "${listKey}" but no list with that key has been defined.`
      );
    }

    // TODO: Check for String-like typing for identityField? How?
    const identityFieldConfig = specifiedListConfig.fields[identityField];
    if (identityFieldConfig === undefined) {
      throw new Error(
        `A createAuth() invocation for the "${listKey}" list specifies ${JSON.stringify(
          identityField
        )} as its identityField but no field with that key exists on the list.`
      );
    }

    // TODO: We could make the secret field optional to disable the standard id/secret auth and password resets (ie. magic links only)
    const secretFieldConfig = specifiedListConfig.fields[secretField];
    if (secretFieldConfig === undefined) {
      throw new Error(
        `A createAuth() invocation for the "${listKey}" list specifies ${JSON.stringify(
          secretField
        )} as its secretField but no field with that key exists on the list.`
      );
    }
    const secretPrototype =
      secretFieldConfig.type &&
      secretFieldConfig.type.implementation &&
      secretFieldConfig.type.implementation.prototype;
    const secretTypename = secretFieldConfig.type && secretFieldConfig.type.type;
    if (typeof secretPrototype.compare !== 'function' || secretPrototype.compare.length < 2) {
      throw new Error(
        `A createAuth() invocation for the "${listKey}" list specifies ${JSON.stringify(
          secretField
        )} as its secretField, which uses the field type ${JSON.stringify(
          secretTypename
        )}. But the ${JSON.stringify(
          secretTypename
        )} field type doesn't implement the required compare() functionality.` +
          (secretTypename !== 'Password'
            ? ` Did you mean to reference a field of type Password instead?`
            : '')
      );
    }
    if (typeof secretPrototype.generateHash !== 'function') {
      throw new Error(
        `A createAuth() invocation for the "${listKey}" list specifies ${JSON.stringify(
          secretField
        )} as its secretField, which uses the field type ${JSON.stringify(
          secretTypename
        )}. But the ${JSON.stringify(
          secretTypename
        )} field type doesn't implement the required generateHash() functionality.` +
          (secretTypename !== 'Password'
            ? ` Did you mean to reference a field of type Password instead?`
            : '')
      );
    }

    // TODO: Could also validate initFirstItem.itemData keys?
    for (const field of initFirstItem?.fields || []) {
      if (specifiedListConfig.fields[field] === undefined) {
        throw new Error(
          `A createAuth() invocation for the "${listKey}" list specifies the field ${JSON.stringify(
            field
          )} in initFirstItem.fields array but no field with that key exist on the list.`
        );
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
    if (keystoneConfig.ui) {
      ui = {
        ...keystoneConfig.ui,
        publicPages: [...(keystoneConfig.ui.publicPages || []), ...publicAuthPages],
        getAdditionalFiles: [...(keystoneConfig.ui.getAdditionalFiles || []), additionalFiles],
        pageMiddleware: async args => {
          return (await adminPageMiddleware(args)) ?? keystoneConfig?.ui?.pageMiddleware?.(args);
        },
        enableSessionItem: true,
        isAccessAllowed: async (context: KeystoneContext) => {
          // Allow access to the adminMeta data from the /init path to correctly render that page
          // even if the user isn't logged in (which should always be the case if they're seeing /init)
          const headers = context.req?.headers;
          const url = headers?.referer ? new URL(headers.referer) : undefined;
          const accessingInitPage =
            url?.pathname === '/init' &&
            url?.host === headers?.host &&
            (await context.createContext({ skipAccessControl: true }).lists[listKey].count({})) ===
              0;
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

    return {
      ...keystoneConfig,
      ui,
      // Add the additional fields to the references lists fields object
      // TODO: The additionalListFields we're adding here shouldn't naively replace existing fields with the same key
      // Leaving existing fields in place would allow solution devs to customise these field defs (eg. access control,
      // work factor for the tokens, etc.) without abandoning the withAuth() interface
      lists: {
        ...keystoneConfig.lists,
        [listKey]: {
          ...keystoneConfig.lists[listKey],
          fields: {
            ...keystoneConfig.lists[listKey].fields,
            ...additionalListFields,
          },
        },
      },
      extendGraphqlSchema: existingExtendGraphQLSchema
        ? (schema, keystone) =>
            existingExtendGraphQLSchema(extendGraphqlSchema(schema, keystone), keystone)
        : extendGraphqlSchema,
    };
  };

  /**
   * Alongside withAuth (recommended) all the config is returned so you can extend or replace
   * the default implementation with your own custom functionality, and integrate the result into
   * your keystone config by hand.
   */
  return {
    ui: {
      enableSessionItem: true,
      pageMiddleware: adminPageMiddleware,
      publicPages: publicAuthPages,
      getAdditionalFiles: additionalFiles,
    },
    fields: additionalListFields,
    extendGraphqlSchema,
    validateConfig,
    withAuth,
  };
}
