import {
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLSchema,
  type DocumentNode,
  execute,
  validate,
  Kind,
  OperationTypeNode,
  type GraphQLFieldConfig,
} from 'graphql'
import { type KeystoneContext } from '../../types'
import { weakMemoize } from '../core/utils'

const getQueryForFragment = weakMemoize((fragment: DocumentNode) => {
  const firstDefinition = fragment.definitions[0]
  if (firstDefinition.kind !== Kind.FRAGMENT_DEFINITION) {
    throw new Error('Expected a fragment definition as the first definition')
  }
  const fragmentName = firstDefinition.name.value

  const typeName = firstDefinition.typeCondition.name.value

  const document: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: [
      {
        kind: Kind.OPERATION_DEFINITION,
        operation: OperationTypeNode.QUERY,
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: [
            {
              kind: Kind.FIELD,
              name: { kind: Kind.NAME, value: typeName },
              selectionSet: {
                kind: Kind.SELECTION_SET,
                selections: [
                  { kind: Kind.FRAGMENT_SPREAD, name: { kind: Kind.NAME, value: fragmentName } },
                ],
              },
            },
          ],
        },
      },
      ...fragment.definitions,
    ],
  }
  return { document, typeName }
})

export function executeSourceToGraphQLFragment(existingSchema: GraphQLSchema) {
  const queryFields: Record<string, GraphQLFieldConfig<any, any>> = {}
  for (const [typeName, type] of Object.entries(existingSchema.getTypeMap())) {
    if (
      type instanceof GraphQLObjectType ||
      type instanceof GraphQLInterfaceType ||
      type instanceof GraphQLUnionType
    ) {
      queryFields[typeName] = { type }
    }
  }
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'InternalKeystoneQueryType',
      fields: queryFields,
    }),
    assumeValid: true,
    types: Object.values(existingSchema.getTypeMap()),
  })

  return async (fragment: DocumentNode, source: unknown, context: KeystoneContext) => {
    const { document, typeName } = getQueryForFragment(fragment)

    const errors = validate(schema, document)
    if (errors.length) {
      throw errors[0]
    }

    const result = await execute({
      schema,
      document,
      contextValue: context,
      rootValue: { [typeName]: source },
    })
    if (result.errors?.length) {
      throw result.errors[0]
    }
    return result.data![typeName]
  }
}
