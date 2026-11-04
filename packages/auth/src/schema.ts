import { assertInputObjectType, GraphQLString, GraphQLID } from 'graphql/index.js'

import { g } from '@keystone-6/core'
import type { KeystoneContext } from '@keystone-6/core/types'
import type { AuthConfig } from './types.ts'
import { getBaseAuthSchema } from './gql/getBaseAuthSchema.ts'

export const getSchemaExtension = ({
  graphqlSingular,
  listKey,
  identityField,
  passwordField,
  sessionStrategy,
  getAuthenticatedItemId,
}: {
  graphqlSingular: string
  listKey: string
  identityField: string
  passwordField: string
  sessionStrategy: AuthConfig<any>['sessionStrategy']
  getAuthenticatedItemId: (context: KeystoneContext) => string | number | undefined
}) =>
  g.extend(base => {
    const whereUniqueInputName = `${graphqlSingular}WhereUniqueInput`
    const uniqueWhereInputType = assertInputObjectType(base.schema.getType(whereUniqueInputName))
    const identityFieldOnUniqueWhere = uniqueWhereInputType.getFields()[identityField]
    if (
      base.schema.extensions.scope === 'internal' &&
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

    return getBaseAuthSchema({
      graphqlSingular,
      identityField,
      listKey,
      passwordField,
      base,
      sessionStrategy,
      getAuthenticatedItemId,
    })
  })
