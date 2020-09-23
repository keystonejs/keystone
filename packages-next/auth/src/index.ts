import url from 'url';

import {
  AdminFileToWrite,
  BaseGeneratedListTypes,
  KeystoneConfig,
  SerializedFieldMeta,
} from '@keystone-spike/types';
import { password, timestamp } from '@keystone-spike/fields';

import { AuthConfig, Auth, AuthGqlNames } from './types';

import { getBaseAuthSchema } from './gql/getBaseAuthSchema';
import { getInitFirstItemSchema } from './gql/getInitFirstItemSchema';
import { getPasswordResetSchema } from './gql/getPasswordResetSchema';
import { getMagicAuthLinkSchema } from './gql/getMagicAuthLinkSchema';

import { signinTemplate } from './templates/signin';
import { initTemplate } from './templates/init';

/**
 * createAuth function
 *
 * Generates config for Keystone to implement standard auth features.
 */
export function createAuth<GeneratedListTypes extends BaseGeneratedListTypes>(
  config: AuthConfig<GeneratedListTypes>
): Auth {
  // Default some config for simplicity
  config.protectIdentities = config.protectIdentities || false;
  config.gqlSuffix = config.gqlSuffix || '';

  const gqlNames: AuthGqlNames = {
    CreateInitialInput: `CreateInitial${config.listKey}Input${config.gqlSuffix}`,
    createInitialItem: `createInitial${config.listKey}${config.gqlSuffix}`,
    authenticateItemWithPassword: `authenticate${config.listKey}WithPassword${config.gqlSuffix}`,
    ItemAuthenticationWithPasswordResult: `${config.listKey}AuthenticationWithPasswordResult${config.gqlSuffix}`,
    ItemAuthenticationWithPasswordSuccess: `${config.listKey}AuthenticationWithPasswordSuccess${config.gqlSuffix}`,
    ItemAuthenticationWithPasswordFailure: `${config.listKey}AuthenticationWithPasswordFailure${config.gqlSuffix}`,
    sendItemPasswordResetLink: `send${config.listKey}PasswordResetLink${config.gqlSuffix}`,
    SendItemPasswordResetLinkResult: `Send${config.listKey}PasswordResetLinkResult${config.gqlSuffix}`,
    validateItemPasswordResetToken: `validate${config.listKey}PasswordResetToken${config.gqlSuffix}`,
    ValidateItemPasswordResetTokenResult: `Validate${config.listKey}PasswordResetTokenResult${config.gqlSuffix}`,
    redeemItemPasswordResetToken: `redeem${config.listKey}PasswordResetToken${config.gqlSuffix}`,
    RedeemItemPasswordResetTokenResult: `Redeem${config.listKey}PasswordResetTokenResult${config.gqlSuffix}`,
    sendItemMagicAuthLink: `send${config.listKey}MagicAuthLink${config.gqlSuffix}`,
    SendItemMagicAuthLinkResult: `Send${config.listKey}MagicAuthLinkResult${config.gqlSuffix}`,
    redeemItemMagicAuthToken: `redeem${config.listKey}MagicAuthToken${config.gqlSuffix}`,
    RedeemItemMagicAuthTokenResult: `Redeem${config.listKey}MagicAuthTokenResult${config.gqlSuffix}`,
    RedeemItemMagicAuthTokenSuccess: `Redeem${config.listKey}MagicAuthTokenSuccess${config.gqlSuffix}`,
    RedeemItemMagicAuthTokenFailure: `Redeem${config.listKey}MagicAuthTokenFailure${config.gqlSuffix}`,
  };

  // Fields added to the auth list
  const additionalListFields = {
    [`${config.secretField}ResetToken`]: password({ access: () => false }), // isRequired: false
    [`${config.secretField}ResetIssuedAt`]: timestamp({ access: () => false, isRequired: false }),
    [`${config.secretField}ResetRedeemedAt`]: timestamp({ access: () => false, isRequired: false }),
    [`magicAuthToken`]: password({ access: () => false }), // isRequired: false
    [`magicAuthIssuedAt`]: timestamp({ access: () => false, isRequired: false }),
    [`magicAuthRedeemedAt`]: timestamp({ access: () => false, isRequired: false }),
  };

  /**
   * adminPageMiddleware
   *
   * Should be added to the admin.pageMiddleware stack.
   *
   * Redirects:
   *  - from the signin or init pages to the index when a valid session is present
   *  - to the init page when initFirstItem is configured, and there are no user in the database
   *  - to the signin page when no valid session is present
   */
  const adminPageMiddleware: Auth['admin']['pageMiddleware'] = async ({
    req,
    isValidSession,
    keystone,
    session,
  }) => {
    const pathname = url.parse(req.url!).pathname!;

    if (isValidSession) {
      if (pathname === '/signin' || (config.initFirstItem && pathname === '/init')) {
        return {
          kind: 'redirect',
          to: '/',
        };
      }
      return;
    }

    if (!session && config.initFirstItem) {
      const { count } = await keystone.keystone.lists[config.listKey].adapter.itemsQuery(
        {},
        {
          meta: true,
        }
      );
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
        to: '/signin',
      };
    }
  };

  /**
   * additionalFiles
   *
   * This function adds files to be generated into the Admin UI build. Must be added to the
   * admin.additionalFiles config.
   *
   * The signin page is always included, and the init page is included when initFirstItem is set
   */
  const additionalFiles: Auth['admin']['getAdditionalFiles'] = keystone => {
    let filesToWrite: AdminFileToWrite[] = [
      {
        mode: 'write',
        outputPath: 'pages/signin.js',
        src: signinTemplate({ gqlNames }),
      },
    ];
    if (config.initFirstItem) {
      const fields: Record<string, SerializedFieldMeta> = {};
      for (const fieldPath of config.initFirstItem.fields) {
        fields[fieldPath] = keystone.adminMeta.lists[config.listKey].fields[fieldPath];
      }

      filesToWrite.push({
        mode: 'write',
        outputPath: 'pages/init.js',
        src: initTemplate({ config, fields }),
      });
    }
    return filesToWrite;
  };

  /**
   * adminPublicPages
   *
   * Must be added to the admin.publicPages config
   */
  const adminPublicPages = ['/signin', '/init'];

  /**
   * extendGraphqlSchema
   *
   * Must be added to the extendGraphqlSchema config. Can be composed.
   */
  let extendGraphqlSchema = getBaseAuthSchema({ ...config, gqlNames });

  // Wrap extendGraphqlSchema to add optional functionality
  if (config.initFirstItem) {
    const existingExtendGraphqlSchema = extendGraphqlSchema;
    const extension = getInitFirstItemSchema({
      listKey: config.listKey,
      fields: config.initFirstItem.fields,
      itemData: config.initFirstItem.itemData,
      gqlNames,
    });
    extendGraphqlSchema = (schema, keystone) =>
      extension(existingExtendGraphqlSchema(schema, keystone), keystone);
  }
  if (config.passwordResetLink) {
    const existingExtendGraphqlSchema = extendGraphqlSchema;
    const extension = getPasswordResetSchema({ ...config, gqlNames });
    extendGraphqlSchema = (schema, keystone) =>
      extension(existingExtendGraphqlSchema(schema, keystone), keystone);
  }
  if (config.magicAuthLink) {
    const existingExtendGraphqlSchema = extendGraphqlSchema;
    const extension = getMagicAuthLinkSchema({ ...config, gqlNames });
    extendGraphqlSchema = (schema, keystone) =>
      extension(existingExtendGraphqlSchema(schema, keystone), keystone);
  }

  /**
   * validateConfig
   *
   * Validates the provided auth config; optional step when integrating auth
   */
  const validateConfig = (keystoneConfig: KeystoneConfig) => {
    const specifiedListConfig = keystoneConfig.lists[config.listKey];
    if (keystoneConfig.lists[config.listKey] === undefined) {
      throw new Error(
        `A createAuth() invocation specifies the list ${JSON.stringify(
          config.listKey
        )} but no list with that key has been defined.`
      );
    }

    // TODO: Check for String-like typing for identityField? How?
    const identityField = specifiedListConfig.fields[config.identityField];
    if (identityField === undefined) {
      throw new Error(
        `A createAuth() invocation for the ${JSON.stringify(
          config.listKey
        )} list specifies ${JSON.stringify(
          config.identityField
        )} as its identityField but no field with that key exists on the list.`
      );
    }

    // TODO: We could make the secret field optional to disable the standard id/secret auth and password resets (ie. magic links only)
    const secretField = specifiedListConfig.fields[config.secretField];
    if (secretField === undefined) {
      throw new Error(
        `A createAuth() invocation for the ${JSON.stringify(
          config.listKey
        )} list specifies ${JSON.stringify(
          config.secretField
        )} as its secretField but no field with that key exists on the list.`
      );
    }
    const secretPrototype =
      secretField.type &&
      secretField.type.implementation &&
      secretField.type.implementation.prototype;
    const secretTypename = secretField.type && secretField.type.type;
    if (typeof secretPrototype.compare !== 'function' || secretPrototype.compare.length < 2) {
      throw new Error(
        `A createAuth() invocation for the ${JSON.stringify(
          config.listKey
        )} list specifies ${JSON.stringify(
          config.secretField
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
        `A createAuth() invocation for the ${JSON.stringify(
          config.listKey
        )} list specifies ${JSON.stringify(
          config.secretField
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

    // TODO: Could also validate config.initFirstItem.itemData keys?
    for (const field of config.initFirstItem?.fields || []) {
      if (specifiedListConfig.fields[field] === undefined) {
        throw new Error(
          `A createAuth() invocation for the ${JSON.stringify(
            config.listKey
          )} list specifies the field ${JSON.stringify(
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
   * config by composing existing extendGraphqlSchema functions and admin config.
   */
  const withAuth = (keystoneConfig: KeystoneConfig): KeystoneConfig => {
    validateConfig(keystoneConfig);
    let admin = keystoneConfig.admin;
    if (keystoneConfig.admin) {
      admin = {
        ...keystoneConfig.admin,
        publicPages: [...(keystoneConfig.admin.publicPages || []), ...adminPublicPages],
        getAdditionalFiles: [...(keystoneConfig.admin.getAdditionalFiles || []), additionalFiles],
        pageMiddleware: async args => {
          return (await adminPageMiddleware(args)) ?? keystoneConfig.admin?.pageMiddleware?.(args);
        },
        enableSessionItem: true,
      };
    }
    const existingExtendGraphQLSchema = keystoneConfig.extendGraphqlSchema;

    // Add the additional fields to the references lists fields object
    // TODO: The additionalListFields we're adding here shouldn't naively replace existing fields with the same key
    // Leaving existing fields in place would allow solution devs to customise these field defs (eg. access control,
    // work factor for the tokens, etc.) without abandoning the withAuth() interface
    keystoneConfig.lists[config.listKey].fields = {
      ...keystoneConfig.lists[config.listKey].fields,
      ...additionalListFields,
    };

    return {
      ...keystoneConfig,
      admin,
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
    admin: {
      enableSessionItem: true,
      pageMiddleware: adminPageMiddleware,
      publicPages: adminPublicPages,
      getAdditionalFiles: additionalFiles,
    },
    fields: additionalListFields,
    extendGraphqlSchema,
    validateConfig,
    withAuth,
  };
}
