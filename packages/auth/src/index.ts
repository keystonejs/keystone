import type {
  AdminFileToWrite,
  BaseListTypeInfo,
  KeystoneContext,
  BaseKeystoneTypeInfo,
  KeystoneConfig,
} from '@keystone-6/core/types'
import type { AuthConfig, AuthGqlNames } from './types'

import { getSchemaExtension } from './schema'
import configTemplate from './templates/config'
import signinTemplate from './templates/signin'
import initTemplate from './templates/init'
import { sessionToItemId } from './gql/getBaseAuthSchema'

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

    CreateInitialInput: `CreateInitial${singular}Input`,
    createInitialItem: `createInitial${singular}`,
  } as const
}

// TODO: use TypeInfo and listKey for types

/**
 * createAuth function
 *
 * Generates config for Keystone to implement standard auth features.
 */
export function createAuth<
  ListTypeInfo extends BaseListTypeInfo & { all: { session: object } },
  SessionStrategySession extends { itemId: string } = { itemId: string },
>({
  listKey,
  secretField,
  initFirstItem,
  identityField,
  sessionStrategy,
  getSession,
}: AuthConfig<ListTypeInfo, SessionStrategySession>) {
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
    if (initFirstItem) {
      filesToWrite.push({
        mode: 'write',
        src: initTemplate({ authGqlNames, listKey, initFirstItem }),
        outputPath: 'pages/init.js',
      })
    }
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

    for (const fieldKey of initFirstItem?.fields || []) {
      if (fieldKey in list.fields) continue

      throw new Error(`initFirstItem.fields has unknown field "${listKey}.${fieldKey}"`)
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
    url,
  }: {
    context: KeystoneContext<TypeInfo>
    wasAccessAllowed: boolean
    basePath: string
    url: string
  }): Promise<{ kind: 'redirect'; to: string } | void> {
    const { pathname } = new URL(url, 'http://_')

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
      initFirstItem,
      sessionStrategy,
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
      async session(args) {
        const session = await sessionStrategy.get(args)
        if (!session) return
        const innerSession = getSession({ data: session, context: args.context })
        if (!innerSession) return
        if (typeof innerSession !== 'object') {
          throw new Error('getSession must return an object')
        }
        sessionToItemId.set(innerSession, session.itemId)
        return innerSession
      },
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

export {
  type SessionStrategy,
  statelessSessions,
  storedSessions,
  type SessionStore,
  type SessionStoreFunction,
} from './session'
