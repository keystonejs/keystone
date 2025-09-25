import type { BaseItem, KeystoneContext } from '@keystone-6/core/types'
import { g } from '@keystone-6/core'
import { getPasswordFieldKDF } from '@keystone-6/core/fields/types/password'
import type { AuthGqlNames } from '../types'
import type { BaseSchemaMeta } from '@keystone-6/core/graphql-ts'
import type { SessionStrategy } from '../session'

const AUTHENTICATION_FAILURE = {
  code: 'FAILURE',
  message: 'Authentication failed.',
} as const

export const sessionToItemId = new WeakMap<object, string>()

export function getBaseAuthSchema<I extends string, S extends string>({
  authGqlNames,
  listKey,
  identityField,
  secretField,
  base,
  sessionStrategy,
}: {
  authGqlNames: AuthGqlNames
  listKey: string
  identityField: I
  secretField: S
  base: BaseSchemaMeta
  sessionStrategy: SessionStrategy<{ itemId: string }, unknown>
}) {
  const kdf = getPasswordFieldKDF(base.schema, listKey, secretField)
  if (!kdf) {
    throw new Error(`${listKey}.${secretField} is not a valid password field.`)
  }

  const ItemAuthenticationWithPasswordSuccess = g.object<{
    sessionToken: string
    item: BaseItem
  }>()({
    name: authGqlNames.ItemAuthenticationWithPasswordSuccess,
    fields: {
      sessionToken: g.field({ type: g.nonNull(g.String) }),
      item: g.field({ type: g.nonNull(base.object(listKey)) }),
    },
  })
  const ItemAuthenticationWithPasswordFailure = g.object<{ message: string }>()({
    name: authGqlNames.ItemAuthenticationWithPasswordFailure,
    fields: {
      message: g.field({ type: g.nonNull(g.String) }),
    },
  })
  const AuthenticationResult = g.union({
    name: authGqlNames.ItemAuthenticationWithPasswordResult,
    types: [ItemAuthenticationWithPasswordSuccess, ItemAuthenticationWithPasswordFailure],
    resolveType(val) {
      if ('sessionToken' in val) return authGqlNames.ItemAuthenticationWithPasswordSuccess
      return authGqlNames.ItemAuthenticationWithPasswordFailure
    },
  })

  const extension = {
    query: {
      authenticatedItem: g.field({
        type: base.object(listKey),
        resolve(rootVal, args, context: KeystoneContext) {
          const { session } = context
          if (!session) return null

          let id
          try {
            id = sessionToItemId.get(session)
          } catch {}
          if (!id) return null

          return context.db[listKey].findOne({ where: { id } })
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
      [authGqlNames.authenticateItemWithPassword]: g.field({
        type: AuthenticationResult,
        args: {
          [identityField]: g.arg({ type: g.nonNull(g.String) }),
          [secretField]: g.arg({ type: g.nonNull(g.String) }),
        },
        async resolve(
          rootVal,
          { [identityField]: identity, [secretField]: secret },
          context: KeystoneContext
        ) {
          const item = await context.sudo().db[listKey].findOne({
            where: { [identityField]: identity },
          })

          if (typeof item?.[secretField] !== 'string') {
            await kdf.hash('simulated-password-to-counter-timing-attack')
            return AUTHENTICATION_FAILURE
          }

          const equal = await kdf.compare(secret, item[secretField])
          if (!equal) return AUTHENTICATION_FAILURE

          const sessionToken = await sessionStrategy.start({
            data: {
              itemId: item.id.toString(),
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

  return {
    extension,
    ItemAuthenticationWithPasswordSuccess,
  }
}
