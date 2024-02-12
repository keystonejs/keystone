import { type BaseItem, type KeystoneContext } from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'
import { type AuthGqlNames, type SecretFieldImpl } from '../types'

import { validateSecret } from '../lib/validateSecret'

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
      if ('sessionToken' in val) {
        return gqlNames.ItemAuthenticationWithPasswordSuccess
      }
      return gqlNames.ItemAuthenticationWithPasswordFailure
    },
  })

  const extension = {
    query: {
      authenticatedItem: graphql.field({
        type: graphql.union({
          name: 'AuthenticatedItem',
          types: [base.object(listKey) as graphql.ObjectType<BaseItem>],
          resolveType: (root, context: KeystoneContext) => context.session?.listKey,
        }),
        resolve (root, args, context: KeystoneContext) {
          const { session } = context
          if (!session) return null
          if (!session.itemId) return null
          if (session.listKey !== listKey) return null

          return context.db[listKey].findOne({
            where: {
              id: session.itemId,
            },
          })
        },
      }),
    },
    mutation: {
      [gqlNames.authenticateItemWithPassword]: graphql.field({
        type: AuthenticationResult,
        args: {
          [identityField]: graphql.arg({ type: graphql.nonNull(graphql.String) }),
          [secretField]: graphql.arg({ type: graphql.nonNull(graphql.String) }),
        },
        async resolve (root, { [identityField]: identity, [secretField]: secret }, context: KeystoneContext) {
          if (!context.sessionStrategy) throw new Error('No session implementation available on context')

          const dbItemAPI = context.sudo().db[listKey]
          const result = await validateSecret(
            secretFieldImpl,
            identityField,
            identity,
            secretField,
            secret,
            dbItemAPI
          )

          if (!result.success) {
            return { code: 'FAILURE', message: 'Authentication failed.' }
          }

          // Update system state
          const sessionToken = await context.sessionStrategy.start({
            data: {
              listKey,
              itemId: result.item.id,
            },
            context,
          })

          // return Failure if sessionStrategy.start() is incompatible
          if (typeof sessionToken !== 'string' || sessionToken.length === 0) {
            return { code: 'FAILURE', message: 'Failed to start session.' }
          }

          return {
            sessionToken,
            item: result.item
          }
        },
      }),
    },
  }

  return { extension, ItemAuthenticationWithPasswordSuccess }
}
