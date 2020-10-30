import url from 'url';

import {
  AdminFileToWrite,
  BaseGeneratedListTypes,
  KeystoneConfig,
  SerializedFieldMeta,
} from '@keystone-next/types';
import { password, timestamp } from '@keystone-next/fields';

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
export function createAuth<GeneratedListTypes extends BaseGeneratedListTypes>({
  listKey,
  secretField,
  protectIdentities = false,
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
    admin: {
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
      if (pathname === '/signin' || (initFirstItem && pathname === '/init')) {
        return {
          kind: 'redirect',
          to: '/',
        };
      }
      return;
    }

    if (!session && initFirstItem) {
      const { count } = await keystone.keystone.lists[listKey].adapter.itemsQuery(
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
    if (initFirstItem) {
      const fields: Record<string, SerializedFieldMeta> = {};
      for (const fieldPath of initFirstItem.fields) {
        fields[fieldPath] = keystone.adminMeta.lists[listKey].fields[fieldPath];
      }

      filesToWrite.push({
        mode: 'write',
        outputPath: 'pages/init.js',
        // wonder what this template expects from config...
        src: initTemplate({ listKey, initFirstItem, fields }),
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
  let extendGraphqlSchema = getBaseAuthSchema({
    identityField,
    listKey,
    protectIdentities,
    secretField,
    gqlNames,
  });

  // Wrap extendGraphqlSchema to add optional functionality
  if (initFirstItem) {
    const existingExtendGraphqlSchema = extendGraphqlSchema;
    const extension = getInitFirstItemSchema({
      listKey: listKey,
      fields: initFirstItem.fields,
      itemData: initFirstItem.itemData,
      gqlNames,
    });
    extendGraphqlSchema = (schema, keystone) =>
      extension(existingExtendGraphqlSchema(schema, keystone), keystone);
  }
  if (passwordResetLink) {
    const existingExtendGraphqlSchema = extendGraphqlSchema;
    const extension = getPasswordResetSchema({
      identityField,
      listKey,
      protectIdentities,
      secretField,
      passwordResetLink,
      gqlNames,
    });
    extendGraphqlSchema = (schema, keystone) =>
      extension(existingExtendGraphqlSchema(schema, keystone), keystone);
  }
  if (magicAuthLink) {
    const existingExtendGraphqlSchema = extendGraphqlSchema;
    const extension = getMagicAuthLinkSchema({
      identityField,
      listKey,
      protectIdentities,
      secretField,
      magicAuthLink,
      gqlNames,
    });
    extendGraphqlSchema = (schema, keystone) =>
      extension(existingExtendGraphqlSchema(schema, keystone), keystone);
  }

  /**
   * validateConfig
   *
   * Validates the provided auth config; optional step when integrating auth
   */
  const validateConfig = (keystoneConfig: KeystoneConfig) => {
    const specifiedListConfig = keystoneConfig.lists[listKey];
    if (keystoneConfig.lists[listKey] === undefined) {
      throw new Error(
        `A createAuth() invocation specifies the list ${JSON.stringify(
          listKey
        )} but no list with that key has been defined.`
      );
    }

    // TODO: Check for String-like typing for identityField? How?
    const identityFieldConfig = specifiedListConfig.fields[identityField];
    if (identityFieldConfig === undefined) {
      throw new Error(
        `A createAuth() invocation for the ${JSON.stringify(
          listKey
        )} list specifies ${JSON.stringify(
          identityField
        )} as its identityField but no field with that key exists on the list.`
      );
    }

    // TODO: We could make the secret field optional to disable the standard id/secret auth and password resets (ie. magic links only)
    const secretFieldConfig = specifiedListConfig.fields[secretField];
    if (secretFieldConfig === undefined) {
      throw new Error(
        `A createAuth() invocation for the ${JSON.stringify(
          listKey
        )} list specifies ${JSON.stringify(
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
        `A createAuth() invocation for the ${JSON.stringify(
          listKey
        )} list specifies ${JSON.stringify(
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
        `A createAuth() invocation for the ${JSON.stringify(
          listKey
        )} list specifies ${JSON.stringify(
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
          `A createAuth() invocation for the ${JSON.stringify(
            listKey
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

    return {
      ...keystoneConfig,
      admin,
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
