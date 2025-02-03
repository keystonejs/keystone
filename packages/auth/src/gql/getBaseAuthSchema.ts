import type {
  BaseItem,
  KeystoneContext
} from '@keystone-6/core/types'
import { g } from '@keystone-6/core'
import type {
  AuthGqlNames,
  SecretFieldImpl,
} from '../types'

const AUTHENTICATION_FAILURE = {
  code: 'FAILURE',
  message: 'Authentication failed.'
} as const

export function getBaseAuthSchema<I extends string, S extends string> ({
  listKey,
  identityField,
  secretField,
  gqlNames,
  secretFieldImpl,
  base,
}: {
  listKey: string
  identityField: I
  secretField: S
  gqlNames: AuthGqlNames
  secretFieldImpl: SecretFieldImpl
  base: g.BaseSchemaMeta
}) {
  const ItemAuthenticationWithPasswordSuccess = g.object<{
    sessionToken: string
    item: BaseItem
  }>()({
    name: gqlNames.ItemAuthenticationWithPasswordSuccess,
    fields: {
      sessionToken: g.field({ type: g.nonNull(g.String) }),
      item: g.field({ type: g.nonNull(base.object(listKey)) }),
    },
  })
  const ItemAuthenticationWithPasswordFailure = g.object<{ message: string }>()({
    name: gqlNames.ItemAuthenticationWithPasswordFailure,
    fields: {
      message: g.field({ type: g.nonNull(g.String) }),
    },
  })
  const AuthenticationResult = g.union({
    name: gqlNames.ItemAuthenticationWithPasswordResult,
    types: [ItemAuthenticationWithPasswordSuccess, ItemAuthenticationWithPasswordFailure],
    resolveType (val) {
      if ('sessionToken' in val) return gqlNames.ItemAuthenticationWithPasswordSuccess
      return gqlNames.ItemAuthenticationWithPasswordFailure
    },
  })

  const extension = {
    query: {
      authenticatedItem: g.field({
        type: base.object(listKey),
        resolve (root, args, context: KeystoneContext) {
          const { session } = context
          if (!session?.itemId) return null

          return context.db[listKey].findOne({
            where: {
              id: session.itemId,
            },
          })
        },
      }),
    },
    mutation: {
      endSession: g.field({
        type: g.nonNull(g.Boolean),
        async resolve (rootVal, args, context) {
          await context.sessionStrategy?.end({ context })
          return true
        },
      }),
      [gqlNames.authenticateItemWithPassword]: g.field({
        type: AuthenticationResult,
        args: {
          [identityField]: g.arg({ type: g.nonNull(g.String) }),
          [secretField]: g.arg({ type: g.nonNull(g.String) }),
        },
        async resolve (root, {
          [identityField]: identity,
          [secretField]: secret
        }, context: KeystoneContext) {
          if (!context.sessionStrategy) throw new Error('No session strategy on context')

          const item = await context.sudo().db[listKey].findOne({
            where: { [identityField]: identity }
          })

          if ((typeof item?.[secretField] !== 'string')) {
            await secretFieldImpl.generateHash('simulated-password-to-counter-timing-attack')
            return AUTHENTICATION_FAILURE
          }

          const equal = await secretFieldImpl.compare(secret, item[secretField])
          if (!equal) return AUTHENTICATION_FAILURE

          const sessionToken = await context.sessionStrategy.start({
            data: {
              itemId: item.id,
            },
            context,
          })

          if (typeof sessionToken !== 'string' || sessionToken.length === 0) {
            return AUTHENTICATION_FAILURE
          }

          return {
            sessionToken,
            item
          }
        },
      }),
    },
  }

  return {
    extension,
    ItemAuthenticationWithPasswordSuccess
  }
}
