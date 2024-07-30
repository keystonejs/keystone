import {
  type BaseItem,
  type KeystoneContext,
} from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'
import { assertInputObjectType, GraphQLInputObjectType, type GraphQLSchema } from 'graphql'
import {
  type AuthGqlNames,
  type InitFirstItemConfig,
} from '../types'

const AUTHENTICATION_FAILURE = 'Authentication failed.' as const

export function getInitFirstItemSchema ({
  listKey,
  fields,
  defaultItemData,
  gqlNames,
  graphQLSchema,
  ItemAuthenticationWithPasswordSuccess,
}: {
  listKey: string
  fields: InitFirstItemConfig<any>['fields']
  defaultItemData: InitFirstItemConfig<any>['itemData']
  gqlNames: AuthGqlNames
  graphQLSchema: GraphQLSchema
  ItemAuthenticationWithPasswordSuccess: graphql.ObjectType<{
    item: BaseItem
    sessionToken: string
  }>
  // TODO: return type required by pnpm :(
}): graphql.Extension {
  const createInputConfig = assertInputObjectType(
    graphQLSchema.getType(`${listKey}CreateInput`)
  ).toConfig()
  const fieldsSet = new Set(fields)
  const initialCreateInput = graphql.wrap.inputObject(
    new GraphQLInputObjectType({
      ...createInputConfig,
      fields: Object.fromEntries(Object.entries(createInputConfig.fields).filter(([fieldKey]) => fieldsSet.has(fieldKey))),
      name: gqlNames.CreateInitialInput,
    })
  )

  return {
    mutation: {
      [gqlNames.createInitialItem]: graphql.field({
        type: graphql.nonNull(ItemAuthenticationWithPasswordSuccess),
        args: { data: graphql.arg({ type: graphql.nonNull(initialCreateInput) }) },
        async resolve (rootVal, { data }, context: KeystoneContext) {
          if (!context.sessionStrategy) throw new Error('No session strategy on context')

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
              ...data
            }
          })

          const sessionToken = await context.sessionStrategy.start({
            data: {
              listKey,
              itemId: item.id,
            },
            context,
          })

          if (typeof sessionToken !== 'string' || sessionToken.length === 0) {
            throw AUTHENTICATION_FAILURE
          }

          return {
            sessionToken,
            item
          }
        },
      }),
    },
  }
}
