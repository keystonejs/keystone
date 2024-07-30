import type {
  BaseItem,
  KeystoneContext
} from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'
import type {
  AuthGqlNames,
  SecretFieldImpl,
} from '../types'

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
  base: graphql.BaseSchemaMeta
  // TODO: return type required by pnpm :(
}): {
  extension: graphql.Extension
  ItemAuthenticationWithPasswordSuccess: graphql.ObjectType<{
    sessionToken: string
    item: BaseItem
  }>
} {
  const ItemAuthenticationWithPasswordSuccess = graphql.object<{
    sessionToken: string
    item: BaseItem
  }>()({
    name: gqlNames.ItemAuthenticationWithPasswordSuccess,
    fields: {
      sessionToken: graphql.field({ type: graphql.nonNull(graphql.String) }),
      item: graphql.field({ type: graphql.nonNull(base.object(listKey)) }),
    },
  })
  const ItemAuthenticationWithPasswordFailure = graphql.object<{ message: string }>()({
    name: gqlNames.ItemAuthenticationWithPasswordFailure,
    fields: {
      message: graphql.field({ type: graphql.nonNull(graphql.String) }),
    },
  })
  const AuthenticationResult = graphql.union({
    name: gqlNames.ItemAuthenticationWithPasswordResult,
    types: [ItemAuthenticationWithPasswordSuccess, ItemAuthenticationWithPasswordFailure],
    resolveType (val) {
      if ('sessionToken' in val) return gqlNames.ItemAuthenticationWithPasswordSuccess
      return gqlNames.ItemAuthenticationWithPasswordFailure
    },
  })

  const extension = {
    query: {
      authenticatedItem: graphql.field({
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
      endSession: graphql.field({
        type: graphql.nonNull(graphql.Boolean),
        async resolve (rootVal, args, context) {
          await context.sessionStrategy?.end({ context })
          return true
        },
      }),
      [gqlNames.authenticateItemWithPassword]: graphql.field({
        type: AuthenticationResult,
        args: {
          [identityField]: graphql.arg({ type: graphql.nonNull(graphql.String) }),
          [secretField]: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        async resolve (root, { [identityField]: identity, [secretField]: secret }, context: KeystoneContext) {
          if (!context.sessionStrategy) throw new Error('No session implementation available on context')

          const item = await context.sudo().db[listKey].findOne({
            where: { [identityField]: identity }
          })

          if ((typeof item?.[secretField] !== 'string')) {
            await secretFieldImpl.generateHash('simulated-password-to-counter-timing-attack')
            return { code: 'FAILURE', message: 'Authentication failed.' }
          }

          const equal = await secretFieldImpl.compare(secret, item[secretField])
          if (!equal) return { code: 'FAILURE', message: 'Authentication failed.' }

          // Update system state
          const sessionToken = await context.sessionStrategy.start({
            data: {
              itemId: item.id,
            },
            context,
          })

          // return Failure if sessionStrategy.start() is incompatible
          if (typeof sessionToken !== 'string' || sessionToken.length === 0) {
            return { code: 'FAILURE', message: 'Failed to start session.' }
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
