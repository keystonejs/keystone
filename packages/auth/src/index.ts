import type {
  AdminFileToWrite,
  BaseListTypeInfo,
  BaseKeystoneTypeInfo,
  KeystoneConfig,
} from '@keystone-6/core/types'
import type { AuthConfig } from './types.ts'

import { getSchemaExtension } from './schema.ts'
import configTemplate from './templates/config.ts'
import signinTemplate from './templates/signin.ts'

// TODO: use TypeInfo and listKey for types
/**
 * createAuth function
 *
 * Generates config for Keystone to implement standard auth features.
 */
export function createAuth<ListTypeInfo extends BaseListTypeInfo>(
  authConfig: AuthConfig<ListTypeInfo>
) {
  const { listKey, passwordField, identityField } = authConfig
  const { sessionStrategy } = authConfig
  const getAuthenticatedItemId = authConfig.getAuthenticatedItemId
  /**
   * getAdditionalFiles
   *
   * This function adds files to be generated into the Admin UI build. Must be added to the
   * ui.getAdditionalFiles config.
   *
   * The signin page is always included.
   */
  const authGetAdditionalFiles = (config: KeystoneConfig) => {
    // TODO: FIXME: this is a duplication of initialise-lists:747
    const listConfig = config.lists[listKey]
    const labelField =
      listConfig.ui?.labelField ??
      (listConfig.fields.label
        ? 'label'
        : listConfig.fields.name
          ? 'name'
          : listConfig.fields.title
            ? 'title'
            : 'id')

    const filesToWrite: AdminFileToWrite[] = [
      {
        mode: 'write',
        src: signinTemplate({ identityField, passwordField }),
        outputPath: 'pages/signin.js',
      },
      {
        mode: 'write',
        src: configTemplate({ labelField }),
        outputPath: 'config.ts',
      },
    ]
    return filesToWrite
  }

  function throwIfInvalidConfig<TypeInfo extends BaseKeystoneTypeInfo>(
    config: KeystoneConfig<TypeInfo>
  ) {
    if (!(listKey in config.lists)) {
      throw new Error(`withAuth cannot find the list "${listKey}"`)
    }

    // TODO: verify that the identity field is unique
    // TODO: verify that the field is required
    const list = config.lists[listKey]
    if (!(identityField in list.fields)) {
      throw new Error(`withAuth cannot find the identity field "${listKey}.${identityField}"`)
    }

    if (!(passwordField in list.fields)) {
      throw new Error(`withAuth cannot find the password field "${listKey}.${passwordField}"`)
    }

    if (config.getSession === undefined) {
      throw new TypeError('Keystone auth requires a getSession configuration')
    }
  }

  function authMiddleware({
    wasAccessAllowed,
    basePath,
  }: {
    wasAccessAllowed: boolean
    basePath: string
  }): { kind: 'redirect'; to: string } | void {
    // don't redirect if we have access
    if (wasAccessAllowed) return

    // otherwise, redirect to signin
    return { kind: 'redirect', to: `${basePath}/signin` }
  }

  function defaultExtendGraphqlSchema<T>(schema: T) {
    return schema
  }

  /**
   * withAuth
   *
   * Automatically extends your configuration with a prescriptive implementation.
   */
  function withAuth<TypeInfo extends BaseKeystoneTypeInfo>(
    config: KeystoneConfig<TypeInfo>
  ): KeystoneConfig<TypeInfo> {
    throwIfInvalidConfig(config)
    let { ui } = config
    if (!ui?.isDisabled) {
      const { getAdditionalFiles = () => [], pageMiddleware, publicPages = [] } = ui || {}
      const authPublicPages = [`${ui?.basePath ?? ''}/signin`]
      ui = {
        ...ui,
        publicPages: [...publicPages, ...authPublicPages],
        getAdditionalFiles: async () => [
          ...(await getAdditionalFiles()),
          ...authGetAdditionalFiles(config),
        ],
        pageMiddleware: async args => {
          const shouldRedirect = authMiddleware(args)
          if (shouldRedirect) return shouldRedirect
          return pageMiddleware?.(args)
        },
      }
    }

    const { graphql } = config
    const { extendGraphqlSchema = defaultExtendGraphqlSchema } = graphql ?? {}
    const graphqlSingular = config.lists[listKey].graphql?.singular ?? listKey
    /**
     * extendGraphqlSchema
     *
     * Must be added to the extendGraphqlSchema config. Can be composed.
     */
    const authExtendGraphqlSchema = getSchemaExtension({
      graphqlSingular,
      listKey,
      identityField,
      passwordField,
      sessionStrategy,
      getAuthenticatedItemId,
    })

    return {
      ...config,
      graphql: {
        ...config.graphql,
        extendGraphqlSchema: schema => {
          return extendGraphqlSchema(authExtendGraphqlSchema(schema))
        },
      },
      ui,
    }
  }

  return {
    withAuth,
  }
}

export {
  jwtSessions,
  storedSessions,
  type SessionStore,
  type SessionStoreFunction,
} from './session.ts'
