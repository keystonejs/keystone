import type {
  AdminFileToWrite,
  BaseListTypeInfo,
  KeystoneContext,
  SessionStrategy,
  BaseKeystoneTypeInfo,
  KeystoneConfig,
} from '@keystone-6/core/types'
import type { AuthConfig, AuthGqlNames } from './types.ts'

import { getSchemaExtension } from './schema.ts'
import configTemplate from './templates/config.ts'
import signinTemplate from './templates/signin.ts'

export type AuthSession = {
  itemId: string | number // TODO: use ListTypeInfo
  data: unknown // TODO: use ListTypeInfo
}

function getAuthGqlNames(singular: string): AuthGqlNames {
  const lowerSingularName = singular.charAt(0).toLowerCase() + singular.slice(1)
  return {
    itemQueryName: lowerSingularName,
    whereUniqueInputName: `${singular}WhereUniqueInput`,

    authenticateItemWithPassword: `authenticate${singular}WithPassword`,
    ItemAuthenticationWithPasswordResult: `${singular}AuthenticationWithPasswordResult`,
    ItemAuthenticationWithPasswordSuccess: `${singular}AuthenticationWithPasswordSuccess`,
    ItemAuthenticationWithPasswordFailure: `${singular}AuthenticationWithPasswordFailure`,
  } as const
}

// TODO: use TypeInfo and listKey for types
/**
 * createAuth function
 *
 * Generates config for Keystone to implement standard auth features.
 */
export function createAuth<ListTypeInfo extends BaseListTypeInfo>({
  listKey,
  secretField,
  identityField,
  sessionData = 'id',
}: AuthConfig<ListTypeInfo>) {
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

    const authGqlNames = getAuthGqlNames(listConfig.graphql?.singular ?? listKey)
    const filesToWrite: AdminFileToWrite[] = [
      {
        mode: 'write',
        src: signinTemplate({ authGqlNames, identityField, secretField }),
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

    if (!(secretField in list.fields)) {
      throw new Error(`withAuth cannot find the secret field "${listKey}.${secretField}"`)
    }
  }

  // this strategy wraps the existing session strategy,
  //   and injects the requested session.data before returning
  function authSessionStrategy<Session extends AuthSession>(
    _sessionStrategy: SessionStrategy<Session>
  ): SessionStrategy<Session> {
    const { get, ...sessionStrategy } = _sessionStrategy
    return {
      ...sessionStrategy,
      get: async ({ context }) => {
        const session = await get({ context })
        const sudoContext = context.sudo()
        if (!session?.itemId) return

        // TODO: replace with SessionSecret: HMAC({ listKey, identityField, secretField }, SessionSecretVar)
        // if (session.listKey !== listKey) return null

        try {
          const data = await sudoContext.query[listKey].findOne({
            where: { id: session.itemId },
            query: sessionData,
          })
          if (!data) return

          return {
            ...session,
            itemId: session.itemId,
            data,
          }
        } catch (e) {
          console.error(e)
          // WARNING: this is probably an invalid configuration
          return
        }
      },
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

  function defaultIsAccessAllowed({ session }: KeystoneContext) {
    return session !== undefined
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
      const {
        getAdditionalFiles = () => [],
        isAccessAllowed = defaultIsAccessAllowed,
        pageMiddleware,
        publicPages = [],
      } = ui || {}
      const authPublicPages = [`${ui?.basePath ?? ''}/signin`]
      ui = {
        ...ui,
        publicPages: [...publicPages, ...authPublicPages],
        getAdditionalFiles: async () => [
          ...(await getAdditionalFiles()),
          ...authGetAdditionalFiles(config),
        ],

        isAccessAllowed,

        pageMiddleware: async args => {
          const shouldRedirect = authMiddleware(args)
          if (shouldRedirect) return shouldRedirect
          return pageMiddleware?.(args)
        },
      }
    }

    if (!config.session) throw new TypeError('Missing .session configuration')

    const { graphql } = config
    const { extendGraphqlSchema = defaultExtendGraphqlSchema } = graphql ?? {}
    const listConfig = config.lists[listKey]

    /**
     * extendGraphqlSchema
     *
     * Must be added to the extendGraphqlSchema config. Can be composed.
     */
    const authGqlNames = getAuthGqlNames(listConfig.graphql?.singular ?? listKey)
    const authExtendGraphqlSchema = getSchemaExtension({
      authGqlNames,
      listKey,
      identityField,
      secretField,
      sessionData,
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
      session: authSessionStrategy(config.session),
      lists: {
        ...config.lists,
        [listKey]: {
          ...listConfig,
          fields: {
            ...listConfig.fields,
          },
        },
      },
    }
  }

  return {
    withAuth,
  }
}
