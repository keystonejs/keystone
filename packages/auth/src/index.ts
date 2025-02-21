import type {
  AdminFileToWrite,
  BaseListTypeInfo,
  KeystoneContext,
  SessionStrategy,
  BaseKeystoneTypeInfo,
  KeystoneConfig,
} from '@keystone-6/core/types'
import type { AuthConfig, AuthGqlNames } from './types'

import { getSchemaExtension } from './schema'
import configTemplate from './templates/config'
import signinTemplate from './templates/signin'
import initTemplate from './templates/init'

export type AuthSession = {
  itemId: string | number // TODO: use ListTypeInfo
  data: unknown // TODO: use ListTypeInfo
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
  initFirstItem,
  identityField,
  sessionData = 'id',
}: AuthConfig<ListTypeInfo>) {
  const authGqlNames: AuthGqlNames = {
    // Core
    authenticateItemWithPassword: `authenticate${listKey}WithPassword`,
    ItemAuthenticationWithPasswordResult: `${listKey}AuthenticationWithPasswordResult`,
    ItemAuthenticationWithPasswordSuccess: `${listKey}AuthenticationWithPasswordSuccess`,
    ItemAuthenticationWithPasswordFailure: `${listKey}AuthenticationWithPasswordFailure`,
    // Initial data
    CreateInitialInput: `CreateInitial${listKey}Input`,
    createInitialItem: `createInitial${listKey}`,
  }

  /**
   * getAdditionalFiles
   *
   * This function adds files to be generated into the Admin UI build. Must be added to the
   * ui.getAdditionalFiles config.
   *
   * The signin page is always included, and the init page is included when initFirstItem is set
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
        src: signinTemplate({ authGqlNames, identityField, secretField }),
        outputPath: 'pages/signin.js',
      },
      {
        mode: 'write',
        src: configTemplate({ labelField }),
        outputPath: 'config.ts',
      },
    ]
    if (initFirstItem) {
      filesToWrite.push({
        mode: 'write',
        src: initTemplate({ authGqlNames, listKey, initFirstItem }),
        outputPath: 'pages/init.js',
      })
    }
    return filesToWrite
  }

  /**
   * extendGraphqlSchema
   *
   * Must be added to the extendGraphqlSchema config. Can be composed.
   */
  const authExtendGraphqlSchema = getSchemaExtension({
    identityField,
    listKey,
    secretField,
    gqlNames: authGqlNames,
    initFirstItem,
    sessionData,
  })

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

    for (const fieldKey of initFirstItem?.fields || []) {
      if (fieldKey in list.fields) continue

      throw new Error(`initFirstItem.fields has unknown field "${listKey}.${fieldKey}"`)
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

  async function hasInitFirstItemConditions<TypeInfo extends BaseKeystoneTypeInfo>(
    context: KeystoneContext<TypeInfo>
  ) {
    // do nothing if they aren't using this feature
    if (!initFirstItem) return false

    // if they have a session, there is no initialisation necessary
    if (context.session) return false

    const count = await context.sudo().db[listKey].count({})
    return count === 0
  }

  async function authMiddleware<TypeInfo extends BaseKeystoneTypeInfo>({
    context,
    wasAccessAllowed,
    basePath,
  }: {
    context: KeystoneContext<TypeInfo>
    wasAccessAllowed: boolean
    basePath: string
  }): Promise<{ kind: 'redirect'; to: string } | void> {
    const { req } = context
    const { pathname } = new URL(req!.url!, 'http://_')

    // redirect to init if initFirstItem conditions are met
    if (pathname !== `${basePath}/init` && (await hasInitFirstItemConditions(context))) {
      return { kind: 'redirect', to: `${basePath}/init` }
    }

    // redirect to / if attempting to /init and initFirstItem conditions are not met
    if (pathname === `${basePath}/init` && !(await hasInitFirstItemConditions(context))) {
      return { kind: 'redirect', to: basePath }
    }

    // don't redirect if we have access
    if (wasAccessAllowed) return

    // otherwise, redirect to signin
    return { kind: 'redirect', to: `${basePath}/signin` }
  }

  function defaultIsAccessAllowed({ session, sessionStrategy }: KeystoneContext) {
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
        getAdditionalFiles = [],
        isAccessAllowed = defaultIsAccessAllowed,
        pageMiddleware,
        publicPages = [],
      } = ui || {}
      const authPublicPages = [`${ui?.basePath ?? ''}/signin`]
      ui = {
        ...ui,
        publicPages: [...publicPages, ...authPublicPages],
        getAdditionalFiles: [...getAdditionalFiles, () => authGetAdditionalFiles(config)],

        isAccessAllowed: async (context: KeystoneContext) => {
          if (await hasInitFirstItemConditions(context)) return true
          return isAccessAllowed(context)
        },

        pageMiddleware: async args => {
          const shouldRedirect = await authMiddleware(args)
          if (shouldRedirect) return shouldRedirect
          return pageMiddleware?.(args)
        },
      }
    }

    if (!config.session) throw new TypeError('Missing .session configuration')

    const { graphql } = config
    const { extendGraphqlSchema = defaultExtendGraphqlSchema } = graphql ?? {}
    const authListConfig = config.lists[listKey]

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
          ...authListConfig,
          fields: {
            ...authListConfig.fields,
          },
        },
      },
    }
  }

  return {
    withAuth,
  }
}
