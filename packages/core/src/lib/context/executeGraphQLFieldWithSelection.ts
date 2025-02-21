import {
  type DocumentNode,
  execute,
  GraphQLList,
  GraphQLNonNull,
  type GraphQLOutputType,
  type GraphQLSchema,
  Kind,
  type OperationTypeNode,
  parse,
  validate,
} from 'graphql'
import { type KeystoneContext } from '../../types'
import { getVariablesForGraphQLField } from './executeGraphQLFieldToSource'

function getRootTypeName(type: GraphQLOutputType): string {
  if (type instanceof GraphQLNonNull) {
    return getRootTypeName(type.ofType)
  }
  if (type instanceof GraphQLList) {
    return getRootTypeName(type.ofType)
  }
  return type.name
}

export function executeGraphQLFieldWithSelection(
  schema: GraphQLSchema,
  operation: 'query' | 'mutation',
  fieldName: string
) {
  const rootType = operation === 'mutation' ? schema.getMutationType()! : schema.getQueryType()!
  const field = rootType.getFields()[fieldName]
  if (field === undefined) {
    return () => {
      // This will be triggered if the field is missing due to `omit` configuration.
      // The GraphQL equivalent would be a bad user input error.
      throw new Error(`This ${operation} is not supported by the GraphQL schema: ${fieldName}()`)
    }
  }
  const { argumentNodes, variableDefinitions } = getVariablesForGraphQLField(field)
  const rootName = getRootTypeName(field.type)
  return async (
    args: Record<string, any>,
    query: string | DocumentNode,
    context: KeystoneContext
  ) => {
    const fragmentDocumentNode =
      typeof query === 'string' ? parse(`fragment x on ${rootName} {${query}}`) : query
    if (fragmentDocumentNode.definitions[0].kind !== Kind.FRAGMENT_DEFINITION) {
      throw new Error(
        `The first definition in \`query\` passed to context.query.${rootName}.* must be a fragment`
      )
    }
    if (fragmentDocumentNode.definitions[0].typeCondition.name.value !== rootName) {
      throw new Error(
        `The fragment in \`query\` passed to context.query.${rootName}.* must be on the type ${rootName}`
      )
    }
    const fragmentName = fragmentDocumentNode.definitions[0].name.value
    const document: DocumentNode = {
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          // OperationTypeNode is an ts enum where the values are 'query' | 'mutation' | 'subscription'
          operation: operation as OperationTypeNode,
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [
              {
                kind: Kind.FIELD,
                name: { kind: Kind.NAME, value: field.name },
                arguments: argumentNodes,
                selectionSet: {
                  kind: Kind.SELECTION_SET,
                  selections: [
                    {
                      kind: Kind.FRAGMENT_SPREAD,
                      name: { kind: Kind.NAME, value: fragmentName },
                    },
                  ],
                },
              },
            ],
          },
          variableDefinitions,
        },
        ...fragmentDocumentNode.definitions,
      ],
    }

    const validationErrors = validate(schema, document)

    if (validationErrors.length > 0) {
      throw validationErrors[0]
    }

    const result = await execute({
      schema,
      document,
      contextValue: context,
      variableValues: Object.fromEntries(
        // GraphQL for some reason decides to make undefined values in args
        // skip defaulting for some reason
        // this ofc doesn't technically fully fix it (bc nested things)
        // but for the cases where we care, it does
        Object.entries(args).filter(([, val]) => val !== undefined)
      ),
      rootValue: {},
    })
    if (result.errors?.length) {
      throw result.errors[0]
    }
    return result.data![field.name]
  }
}
