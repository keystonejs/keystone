import {
  AdminFileToWrite,
  BaseGeneratedListTypes,
  KeystoneConfig,
  SerializedFieldMeta,
} from '@keystone-spike/types';
import { getExtendGraphQLSchema } from './getExtendGraphQLSchema';
import { AuthConfig, Auth, ResolvedAuthGqlNames } from './types';
import url from 'url';
import { initFirstItemSchemaExtension } from './initFirstItemSchemaExtension';

export function createAuth<GeneratedListTypes extends BaseGeneratedListTypes>(
  config: AuthConfig<GeneratedListTypes>
): Auth {
  const adminPageMiddleware: Auth['admin']['pageMiddleware'] = async ({
    req,
    isValidSession,
    keystone,
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
    if (config.initFirstItem) {
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

    if (pathname !== '/signin') {
      return {
        kind: 'redirect',
        to: '/signin',
      };
    }
  };
  const gqlNames: ResolvedAuthGqlNames = {
    authenticateItemWithPassword: `authenticate${config.listKey}WithPassword`,
    createInitialItem: `createInitial${config.listKey}`,
    sendItemForgottenPassword: `send${config.listKey}ForgottenPassword`,
    sendItemMagicAuthenticateLink: `send${config.listKey}MagicAuthenticateLink`,
    ItemAuthenticationWithPasswordResult: `${config.listKey}AuthenticationWithPasswordResult`,
  };
  const additionalFiles: Auth['admin']['getAdditionalFiles'] = keystone => {
    let filesToWrite: AdminFileToWrite[] = [
      {
        mode: 'write',
        outputPath: 'pages/signin.js',
        src: `
import React from 'react';
import { gql } from '@keystone-spike/admin-ui/apollo';
import { SigninPage } from '@keystone-spike/auth/pages/SigninPage'
      
export default function Signin() {
  return <SigninPage mutation={gql\`
  mutation($identity: String!, $secret: String!) {
    ${gqlNames.authenticateItemWithPassword}(email: $identity, password: $secret) {
      item {
        id
      }
    }
  }
  \`} />
}
      `,
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
        src: `import { InitPage } from '@keystone-spike/auth/pages/InitPage';
import React from 'react';
import { gql } from '@keystone-spike/admin-ui/apollo';

const fieldsMeta = ${JSON.stringify(fields)}

const mutation = gql\`mutation($data: CreateInitial${config.listKey}Input!) {
  createInitial${config.listKey}(data: $data) {
    item {
      id
    }
  }
}\`

export default function Init() {
  return <InitPage fields={fieldsMeta} showKeystoneSignup={${JSON.stringify(
    !config.initFirstItem.skipKeystoneSignup
  )}} mutation={mutation} />
}
`,
      });
    }
    return filesToWrite;
  };

  let extendGraphqlSchema = getExtendGraphQLSchema({
    ...config,
    protectIdentities: config.protectIdentities || false,
    gqlNames,
  });
  if (config.initFirstItem) {
    let existingExtendGraphqlSchema = extendGraphqlSchema;
    let extension = initFirstItemSchemaExtension({
      listKey: config.listKey,
      fields: config.initFirstItem.fields,
      extraCreateInput: config.initFirstItem.extraCreateInput,
      gqlNames,
    });
    extendGraphqlSchema = (schema, keystone) =>
      extension(existingExtendGraphqlSchema(schema, keystone), keystone);
  }
  const adminPublicPages = ['/signin', '/init'];

  // TODO
  const validateConfig = (keystoneConfig: KeystoneConfig) => {
    const specifiedListConfig = keystoneConfig.lists[config.listKey];
    if (keystoneConfig.lists[config.listKey] === undefined) {
      throw new Error(
        `In createAuth, you've specified the list ${JSON.stringify(
          config.listKey
        )} but you do not have a list named ${JSON.stringify(config.listKey)}`
      );
    }
    if (specifiedListConfig.fields[config.identityField] === undefined) {
      throw new Error(
        `In createAuth, you\'ve specified ${JSON.stringify(
          config.identityField
        )} as your identityField on ${JSON.stringify(config.listKey)} but ${JSON.stringify(
          config.listKey
        )} does not have a field named ${JSON.stringify(config.identityField)}`
      );
    }
    if (specifiedListConfig.fields[config.secretField] === undefined) {
      throw new Error(
        `In createAuth, you've specified ${JSON.stringify(
          config.secretField
        )} as your secretField on ${JSON.stringify(config.listKey)} but ${JSON.stringify(
          config.listKey
        )} does not have a field named ${JSON.stringify(config.secretField)}`
      );
    }

    for (const field of config.initFirstItem?.fields || []) {
      if (specifiedListConfig.fields[field] === undefined) {
        throw new Error(
          `In createAuth, you've specified the field ${JSON.stringify(
            field
          )} in initFirstItem.fields but it does not exist on the list ${JSON.stringify(
            config.listKey
          )}`
        );
      }
    }
  };

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
      extendGraphqlSchema: existingExtendGraphQLSchema
        ? (schema, keystone) =>
            existingExtendGraphQLSchema(extendGraphqlSchema(schema, keystone), keystone)
        : extendGraphqlSchema,
    };
  };

  return {
    admin: {
      enableSessionItem: true,
      pageMiddleware: adminPageMiddleware,
      publicPages: adminPublicPages,
      getAdditionalFiles: additionalFiles,
    },
    extendGraphqlSchema,
    validateConfig,
    withAuth,
  };
}
