import type { BaseItem, KeystoneContext } from '@keystone-6/core/types'
import { g } from '@keystone-6/core'
import { assertInputObjectType, GraphQLInputObjectType, type GraphQLSchema } from 'graphql'
import { type AuthGqlNames, type InitFirstItemConfig } from '../types'
import type { Extension } from '@keystone-6/core/graphql-ts'
import type { SessionStrategy } from '../session'

const AUTHENTICATION_FAILURE = 'Authentication failed.' as const

export function getInitFirstItemSchema({
  authGqlNames,
  listKey,
  fields,
  defaultItemData,
  graphQLSchema,
  ItemAuthenticationWithPasswordSuccess,
  sessionStrategy,
}: {
  authGqlNames: AuthGqlNames
  listKey: string
  fields: InitFirstItemConfig<any>['fields']
  defaultItemData: InitFirstItemConfig<any>['itemData']
  graphQLSchema: GraphQLSchema
  ItemAuthenticationWithPasswordSuccess: g<
    typeof g.object<{
      item: BaseItem
      sessionToken: string
    }>
  >
  sessionStrategy: SessionStrategy<{ itemId: string }, unknown>
  // TODO: return type required by pnpm :(
}): Extension {
  const createInputConfig = assertInputObjectType(
    graphQLSchema.getType(`${listKey}CreateInput`)
  ).toConfig()
  const fieldsSet = new Set(fields)
  const initialCreateInput = new GraphQLInputObjectType({
    ...createInputConfig,
    fields: Object.fromEntries(
      Object.entries(createInputConfig.fields).filter(([fieldKey]) => fieldsSet.has(fieldKey))
    ),
    name: authGqlNames.CreateInitialInput,
  })

  return {
    mutation: {
      [authGqlNames.createInitialItem]: g.field({
        type: g.nonNull(ItemAuthenticationWithPasswordSuccess),
        args: { data: g.arg({ type: g.nonNull(initialCreateInput) }) },
        async resolve(rootVal, { data }, context: KeystoneContext) {
          const sudoContext = context.sudo()

          // should approximate hasInitFirstItemConditions
          const count = await sudoContext.db[listKey].count()
          if (count !== 0) throw AUTHENTICATION_FAILURE

          // Update system state
          // this is strictly speaking incorrect. the db API will do GraphQL coercion on a value which has already been coerced
          // (this is also mostly fine, the chance that people are using things where
          // the input value can't round-trip like the Upload scalar here is quite low)
          const item = await sudoContext.db[listKey].createOne({
            data: {
              ...defaultItemData,
              ...data,
            },
          })

          const sessionToken = await sessionStrategy.start({
            data: {
              itemId: item.id.toString(),
            },
            context,
          })

          if (typeof sessionToken !== 'string' || sessionToken.length === 0) {
            throw AUTHENTICATION_FAILURE
          }

          return {
            sessionToken,
            item,
          }
        },
      }),
    },
  }
}
