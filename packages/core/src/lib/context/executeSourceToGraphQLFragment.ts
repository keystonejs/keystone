import type {
  GraphQLOutputType} from 'graphql'
import {
  GraphQLObjectType,
  GraphQLSchema,
  type DocumentNode,
  execute,
  Kind,
  OperationTypeNode,
  isOutputType
} from 'graphql'
import { type KeystoneContext } from '../../types'
import { weakMemoize } from '../core/utils'

const rawField = 'raw'

const getQueryForFragment = weakMemoize((fragment:DocumentNode) => {
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
              name: { kind: Kind.NAME, value: rawField },
              selectionSet: {
                kind: Kind.SELECTION_SET,
                selections: [{ kind: Kind.FRAGMENT_SPREAD, name: { kind: Kind.NAME, value: fragmentName } }],
              },
            },
          ],
        },
      },
      ...fragment.definitions,
    ],
  }
  return {document, typeName}
})

const getSchemaForType = weakMemoize((existingSchema:GraphQLSchema) => {
  return weakMemoize((outputType:GraphQLOutputType) => {
    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: { [rawField]: { type: outputType } },
      }),
      assumeValid: true,
      types: Object.values(existingSchema.getTypeMap()).filter(t => t.name !== 'Query'),
    })
  })
})

export async function executeSourceToGraphQLFragment (existingSchema: GraphQLSchema, fragment: DocumentNode, source: unknown, context: KeystoneContext) {
  const {document, typeName} = getQueryForFragment(fragment)

  const type = existingSchema.getType(typeName)
  if (!isOutputType(type)) {
    throw new Error(`Type ${typeName} does not exist or is not an output type`)
  }

  const schema = getSchemaForType(existingSchema)(type)

  // todo: validate the query?

  const result = await execute({
    schema,
    document,
    contextValue: context,
    rootValue: { [rawField]: source },
  })
  if (result.errors?.length) {
    throw result.errors[0]
  }
  return result.data![rawField]
}
