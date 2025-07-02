import { assertInputObjectType, GraphQLString, GraphQLID, parse, validate } from 'graphql'

import { g } from '@keystone-6/core'
import type { AuthGqlNames, AuthTokenTypeConfig, InitFirstItemConfig } from './types'
import { getBaseAuthSchema } from './gql/getBaseAuthSchema'
import { getInitFirstItemSchema } from './gql/getInitFirstItemSchema'

export const getSchemaExtension = ({
  authGqlNames,
  listKey,
  identityField,
  secretField,
  initFirstItem,
  sessionData,
}: {
  authGqlNames: AuthGqlNames
  listKey: string
  identityField: string
  secretField: string
  initFirstItem?: InitFirstItemConfig<any>
  passwordResetLink?: AuthTokenTypeConfig
  magicAuthLink?: AuthTokenTypeConfig
  sessionData: string
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
      authGqlNames: authGqlNames,
      identityField,
      listKey,
      secretField,
      base,
    })

    // technically this will incorrectly error if someone has a schema extension that adds a field to the list output type
    // and then wants to fetch that field with `sessionData` but it's extremely unlikely someone will do that since if
    // they want to add a GraphQL field, they'll probably use a virtual field
    const query = `query($id: ID!) { ${authGqlNames.itemQueryName}(where: { id: $id }) { ${sessionData} } }`

    let ast
    try {
      ast = parse(query)
    } catch (err) {
      throw new Error(
        `The query to get session data has a syntax error, the sessionData option in your createAuth usage is likely incorrect\n${err}`
      )
    }

    const errors = validate(base.schema, ast)
    if (errors.length) {
      throw new Error(
        `The query to get session data has validation errors, the sessionData option in your createAuth usage is likely incorrect\n${errors.join('\n')}`
      )
    }

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
        }),
    ].filter((x): x is Exclude<typeof x, undefined> => x !== undefined)
  })
