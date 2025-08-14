import {
  type ArgumentNode,
  astFromValue,
  type ConstValueNode,
  type DocumentNode,
  execute,
  type FragmentDefinitionNode,
  type GraphQLArgument,
  type GraphQLArgumentConfig,
  type GraphQLEnumType,
  type GraphQLField,
  type GraphQLFieldConfig,
  type GraphQLInputObjectType,
  type GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  type GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema,
  type GraphQLType,
  type GraphQLUnionType,
  Kind,
  type ListTypeNode,
  type NamedTypeNode,
  OperationTypeNode,
  parse,
  type TypeNode,
  validate,
  type VariableDefinitionNode,
} from 'graphql'

import type { KeystoneContext } from '../../types'

function getNamedOrListTypeNodeForType(
  type:
    | GraphQLScalarType
    | GraphQLObjectType<any, any>
    | GraphQLInterfaceType
    | GraphQLUnionType
    | GraphQLEnumType
    | GraphQLInputObjectType
    | GraphQLList<any>
): NamedTypeNode | ListTypeNode {
  if (type instanceof GraphQLList) {
    return { kind: Kind.LIST_TYPE, type: getTypeNodeForType(type.ofType) }
  }
  return { kind: Kind.NAMED_TYPE, name: { kind: Kind.NAME, value: type.name } }
}

export function getTypeNodeForType(type: GraphQLType): TypeNode {
  if (type instanceof GraphQLNonNull) {
    return { kind: Kind.NON_NULL_TYPE, type: getNamedOrListTypeNodeForType(type.ofType) }
  }
  return getNamedOrListTypeNodeForType(type)
}

function getVariablesForGraphQLField(field: GraphQLField<any, any>) {
  const variableDefinitions: VariableDefinitionNode[] = field.args.map(
    (arg): VariableDefinitionNode => ({
      kind: Kind.VARIABLE_DEFINITION,
      type: getTypeNodeForType(arg.type),
      variable: { kind: Kind.VARIABLE, name: { kind: Kind.NAME, value: arg.name } },
      defaultValue:
        arg.defaultValue === undefined
          ? undefined
          : ((astFromValue(arg.defaultValue, arg.type) as ConstValueNode) ?? undefined),
    })
  )

  const argumentNodes: ArgumentNode[] = field.args.map(arg => ({
    kind: Kind.ARGUMENT,
    name: { kind: Kind.NAME, value: arg.name },
    value: { kind: Kind.VARIABLE, name: { kind: Kind.NAME, value: arg.name } },
  }))

  return { variableDefinitions, argumentNodes }
}

function getRootTypeName(type: GraphQLOutputType): string {
  if (type instanceof GraphQLNonNull) {
    return getRootTypeName(type.ofType)
  }
  if (type instanceof GraphQLList) {
    return getRootTypeName(type.ofType)
  }
  return type.name
}

const rawField = 'raw'

const RawScalar = new GraphQLScalarType({ name: 'RawThingPlsDontRelyOnThisAnywhere' })

const ReturnRawValueObjectType = new GraphQLObjectType({
  name: 'ReturnRawValue',
  fields: {
    [rawField]: {
      type: RawScalar,
      resolve(source) {
        return source
      },
    },
  },
})

type RequiredButStillAllowUndefined<
  T extends Record<string, any>,
  // this being a param is important and is what makes this work,
  // please do not move it inside the mapped type.
  // i can't find a place that explains this but the tldr is that
  // having the keyof T _inside_ the mapped type means TS will keep modifiers
  // like readonly and optionality and we want to remove those here
  Key extends keyof T = keyof T,
> = {
  [K in Key]: T[K]
}

function argsToArgsConfig(args: readonly GraphQLArgument[]) {
  return Object.fromEntries(
    args.map(arg => {
      const argConfig: RequiredButStillAllowUndefined<GraphQLArgumentConfig> = {
        astNode: arg.astNode,
        defaultValue: arg.defaultValue,
        deprecationReason: arg.deprecationReason,
        description: arg.description,
        extensions: arg.extensions,
        type: arg.type,
      }
      return [arg.name, argConfig]
    })
  )
}

type OutputTypeWithoutNonNull = GraphQLObjectType | GraphQLList<OutputType>

type OutputType = OutputTypeWithoutNonNull | GraphQLNonNull<OutputTypeWithoutNonNull>

// note the GraphQLNonNull and GraphQLList constructors are incorrectly
// not generic over their inner type which is why we have to use as
// (the classes are generic but not the constructors)
function getTypeForField(originalType: GraphQLOutputType): OutputType {
  if (originalType instanceof GraphQLNonNull) {
    return new GraphQLNonNull(getTypeForField(originalType.ofType)) as OutputType
  }
  if (originalType instanceof GraphQLList) {
    return new GraphQLList(getTypeForField(originalType.ofType)) as OutputType
  }
  return ReturnRawValueObjectType
}

function getSourceGivenOutputType(originalType: OutputType, value: any): any {
  if (originalType instanceof GraphQLNonNull) {
    return getSourceGivenOutputType(originalType.ofType, value)
  }
  if (value === null) return null
  if (originalType instanceof GraphQLList) {
    return value.map((x: any) => getSourceGivenOutputType(originalType.ofType, x))
  }
  return value[rawField]
}

export function makeContextDbFn(field: GraphQLField<any, unknown>) {
  const { argumentNodes, variableDefinitions } = getVariablesForGraphQLField(field)
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
              name: { kind: Kind.NAME, value: field.name },
              arguments: argumentNodes,
              selectionSet: {
                kind: Kind.SELECTION_SET,
                selections: [{ kind: Kind.FIELD, name: { kind: Kind.NAME, value: rawField } }],
              },
            },
          ],
        },
        variableDefinitions,
      },
    ],
  }

  const type = getTypeForField(field.type)
  const fieldConfig: RequiredButStillAllowUndefined<GraphQLFieldConfig<unknown, unknown>> = {
    args: argsToArgsConfig(field.args),
    astNode: undefined,
    deprecationReason: field.deprecationReason,
    description: field.description,
    extensions: field.extensions,
    resolve: field.resolve,
    subscribe: field.subscribe,
    type,
  }

  // we construct a schema as we need return a different type than the one in the base GraphQL schema
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        [field.name]: fieldConfig,
      },
    }),
    assumeValid: true,
  })

  return async (
    args: Record<string, unknown>,
    context: KeystoneContext,
    rootValue: Record<string, string> = {}
  ) => {
    const result = await execute({
      schema,
      document,
      contextValue: context,
      variableValues: args,
      rootValue,
    })
    if (result.errors?.length) {
      throw result.errors[0]
    }
    return getSourceGivenOutputType(type, result.data![field.name])
  }
}

export function makeContextQueryFn(
  schema: GraphQLSchema,
  operation: 'query' | 'mutation',
  field: GraphQLField<any, unknown>
) {
  const { argumentNodes, variableDefinitions } = getVariablesForGraphQLField(field)
  const rootName = getRootTypeName(field.type)
  const exec = async (args: Record<string, any>, query: string, context: KeystoneContext) => {
    const selectionSet = (
      parse(`fragment x on ${rootName} {${query}}`).definitions[0] as FragmentDefinitionNode
    ).selectionSet

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
                selectionSet: selectionSet,
              },
            ],
          },
          variableDefinitions,
        },
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

  return (
    _args: {
      query?: string
    } & Record<string, unknown> = {}, // WARNING: sometimes this is undefined somewhere
    context: KeystoneContext
  ) => {
    const { query, ...args } = _args
    return exec(args, query ?? 'id', context) as Promise<any>
  }
}
