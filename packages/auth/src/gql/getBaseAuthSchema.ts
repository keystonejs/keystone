import type { BaseItem, KeystoneContext } from '@keystone-6/core/types'
import { g } from '@keystone-6/core'
import { getPasswordFieldKDF } from '@keystone-6/core/fields/types/password'
import type { AuthConfig } from '../types.ts'
import type { BaseSchemaMeta } from '@keystone-6/core/graphql-ts'

const AUTHENTICATION_FAILURE = {
  code: 'FAILURE',
  message: 'Authentication failed.',
} as const

export function getAuthenticatedItemId(
  context: KeystoneContext,
  getItemId: (context: KeystoneContext) => string | number | undefined
) {
  const itemId = getItemId(context)
  if (itemId === undefined) return
  if (typeof itemId !== 'string' && typeof itemId !== 'number') {
    throw new TypeError('getAuthenticatedItemId must return a string, number, or undefined')
  }
  return itemId
}

export function getBaseAuthSchema<I extends string, P extends string>({
  graphqlSingular,
  listKey,
  identityField,
  passwordField,
  base,
  sessionStrategy,
  getAuthenticatedItemId: getItemId,
}: {
  graphqlSingular: string
  listKey: string
  identityField: I
  passwordField: P
  base: BaseSchemaMeta
  sessionStrategy: AuthConfig<any>['sessionStrategy']
  getAuthenticatedItemId: (context: KeystoneContext) => string | number | undefined
}) {
  const kdf = getPasswordFieldKDF(base.schema, graphqlSingular, passwordField)
  if (!kdf) {
    throw new Error(`${listKey}.${passwordField} is not a valid password field.`)
  }

  const AuthenticationWithPasswordSuccess = g.object<{
    sessionToken: string
    item: BaseItem
  }>()({
    name: 'AuthenticationWithPasswordSuccess',
    fields: {
      sessionToken: g.field({ type: g.nonNull(g.String) }),
      item: g.field({ type: g.nonNull(base.object(graphqlSingular)) }),
    },
  })
  const AuthenticationWithPasswordFailure = g.object<{ message: string }>()({
    name: 'AuthenticationWithPasswordFailure',
    fields: {
      message: g.field({ type: g.nonNull(g.String) }),
    },
  })
  const AuthenticationResult = g.union({
    name: 'AuthenticationWithPasswordResult',
    types: [AuthenticationWithPasswordSuccess, AuthenticationWithPasswordFailure],
    resolveType(val) {
      if ('sessionToken' in val) return 'AuthenticationWithPasswordSuccess'
      return 'AuthenticationWithPasswordFailure'
    },
  })

  const extension = {
    query: {
      authenticatedItem: g.field({
        type: base.object(graphqlSingular),
        resolve(rootVal, args, context: KeystoneContext) {
          const itemId = getAuthenticatedItemId(context, getItemId)
          if (itemId === undefined) return null

          return context.db[listKey].findOne({ where: { id: itemId } })
        },
      }),
    },
    mutation: {
      endSession: g.field({
        type: g.nonNull(g.Boolean),
        async resolve(rootVal, args, context) {
          await sessionStrategy.end({ context })
          return true
        },
      }),
      authenticateWithPassword: g.field({
        type: AuthenticationResult,
        args: {
          identity: g.arg({ type: g.nonNull(g.String) }),
          password: g.arg({ type: g.nonNull(g.String) }),
        },
        async resolve(rootVal, { identity, password }, context: KeystoneContext) {
          const item = await context.sudo().db[listKey].findOne({
            where: { [identityField]: identity },
          })

          if (typeof item?.[passwordField] !== 'string') {
            await kdf.hash('simulated-password-to-counter-timing-attack')
            return AUTHENTICATION_FAILURE
          }

          const equal = await kdf.compare(password, item[passwordField])
          if (!equal) return AUTHENTICATION_FAILURE

          const sessionToken = await sessionStrategy.start({
            data: {
              sub: item.id.toString(),
            },
            context,
          })

          if (typeof sessionToken !== 'string' || sessionToken.length === 0) {
            return AUTHENTICATION_FAILURE
          }

          return {
            sessionToken,
            item,
          }
        },
      }),
    },
  }

  return extension
}
