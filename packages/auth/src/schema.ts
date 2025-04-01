import { assertInputObjectType, GraphQLString, GraphQLID } from 'graphql'

import { g } from '@keystone-6/core'
import type { AuthGqlNames, InitFirstItemConfig } from './types'
import { getBaseAuthSchema } from './gql/getBaseAuthSchema'
import { getInitFirstItemSchema } from './gql/getInitFirstItemSchema'
import type { SessionStrategy } from './session'

export const getSchemaExtension = ({
  authGqlNames,
  listKey,
  identityField,
  secretField,
  initFirstItem,
  sessionStrategy,
}: {
  authGqlNames: AuthGqlNames
  listKey: string
  identityField: string
  secretField: string
  initFirstItem?: InitFirstItemConfig<any>
  sessionStrategy: SessionStrategy<{ itemId: string }, unknown>
}) =>
  g.extend(base => {
    const uniqueWhereInputType = assertInputObjectType(
      base.schema.getType(authGqlNames.whereUniqueInputName)
    )
    const identityFieldOnUniqueWhere = uniqueWhereInputType.getFields()[identityField]
    if (
      base.schema.extensions.sudo &&
      identityFieldOnUniqueWhere?.type !== GraphQLString &&
      identityFieldOnUniqueWhere?.type !== GraphQLID
    ) {
      throw new Error(
        `createAuth was called with an identityField of ${identityField} on the list ${listKey} ` +
          `but that field doesn't allow being searched uniquely with a String or ID. ` +
          `You should likely add \`isIndexed: 'unique'\` ` +
          `to the field at ${listKey}.${identityField}`
      )
    }

    const baseSchema = getBaseAuthSchema({
      authGqlNames,
      identityField,
      listKey,
      secretField,
      base,
      sessionStrategy,
    })

    return [
      baseSchema.extension,
      initFirstItem &&
        getInitFirstItemSchema({
          authGqlNames,
          listKey,
          fields: initFirstItem.fields,
          defaultItemData: initFirstItem.itemData,
          graphQLSchema: base.schema,
          ItemAuthenticationWithPasswordSuccess: baseSchema.ItemAuthenticationWithPasswordSuccess,
          sessionStrategy,
        }),
    ].filter(x => x !== undefined)
  })
