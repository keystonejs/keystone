import { assertInputObjectType, GraphQLString, GraphQLID } from 'graphql'

import { g } from '@keystone-6/core'
import type { AuthGqlNames, InitFirstItemConfig } from './types'
import { getBaseAuthSchema } from './gql/getBaseAuthSchema'
import { getInitFirstItemSchema } from './gql/getInitFirstItemSchema'
import type { SessionStrategy } from './session'

export const getSchemaExtension = ({
  identityField,
  listKey,
  secretField,
  gqlNames,
  initFirstItem,
  sessionStrategy,
}: {
  identityField: string
  listKey: string
  secretField: string
  gqlNames: AuthGqlNames
  initFirstItem?: InitFirstItemConfig<any>
  sessionStrategy: SessionStrategy<{ itemId: string }, unknown>
}) =>
  g.extend(base => {
    const uniqueWhereInputType = assertInputObjectType(
      base.schema.getType(`${listKey}WhereUniqueInput`)
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
      identityField,
      listKey,
      secretField,
      gqlNames,
      base,
      sessionStrategy,
    })

    return [
      baseSchema.extension,
      initFirstItem &&
        getInitFirstItemSchema({
          listKey,
          fields: initFirstItem.fields,
          defaultItemData: initFirstItem.itemData,
          gqlNames,
          graphQLSchema: base.schema,
          ItemAuthenticationWithPasswordSuccess: baseSchema.ItemAuthenticationWithPasswordSuccess,
          sessionStrategy,
        }),
    ].filter(x => x !== undefined)
  })
