import { KeystoneContext } from '@keystone-next/types';
import {
  GraphQLScalarType,
  GraphQLObjectType,
  GraphQLArgument,
  GraphQLArgumentConfig,
  GraphQLSchema,
  DocumentNode,
  validate,
  execute,
  GraphQLField,
  VariableDefinitionNode,
  TypeNode,
  GraphQLType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  ListTypeNode,
  NamedTypeNode,
  ArgumentNode,
} from 'graphql';

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
    return { kind: 'ListType', type: getTypeNodeForType(type.ofType) };
  }
  return { kind: 'NamedType', name: { kind: 'Name', value: type.name } };
}

function getTypeNodeForType(type: GraphQLType): TypeNode {
  if (type instanceof GraphQLNonNull) {
    return { kind: 'NonNullType', type: getNamedOrListTypeNodeForType(type.ofType) };
  }
  return getNamedOrListTypeNodeForType(type);
}

function getVariablesForGraphQLField(field: GraphQLField<any, any>) {
  const variableDefinitions: VariableDefinitionNode[] = [];

  for (const arg of field.args) {
    variableDefinitions.push({
      kind: 'VariableDefinition',
      type: getTypeNodeForType(arg.type),
      variable: { kind: 'Variable', name: { kind: 'Name', value: `${arg.name}` } },
    });
  }

  const argumentNodes: ArgumentNode[] = field.args.map(arg => ({
    kind: 'Argument',
    name: { kind: 'Name', value: arg.name },
    value: { kind: 'Variable', name: { kind: 'Name', value: `${arg.name}` } },
  }));

  return { variableDefinitions, argumentNodes };
}

const rawField = 'raw';

const RawScalar = new GraphQLScalarType({ name: 'RawThingPlsDontRelyOnThisAnywhere' });

const ReturnRawValueObjectType = new GraphQLObjectType({
  name: 'ReturnRawValue',
  fields: {
    raw: {
      type: RawScalar,
      resolve(rootVal) {
        return rootVal;
      },
    },
  },
});

function argsToArgsConfig(args: GraphQLArgument[]) {
  return Object.fromEntries(args.map((arg): [string, GraphQLArgumentConfig] => [arg.name, arg]));
}

export function executeGraphQLFieldToRootVal(field: GraphQLField<any, any>) {
  const { argumentNodes, variableDefinitions } = getVariablesForGraphQLField(field);

  const document: DocumentNode = {
    kind: 'Document',
    definitions: [
      {
        kind: 'OperationDefinition',
        operation: 'query',
        selectionSet: {
          kind: 'SelectionSet',
          selections: [
            {
              kind: 'Field',
              name: { kind: 'Name', value: field.name },
              arguments: argumentNodes,
              selectionSet: {
                kind: 'SelectionSet',
                selections: [{ kind: 'Field', name: { kind: 'Name', value: rawField } }],
              },
            },
          ],
        },
        variableDefinitions,
      },
    ],
  };
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        [field.name]: {
          ...field,
          args: argsToArgsConfig(field.args),
          type: ReturnRawValueObjectType,
        },
      },
    }),
  });

  const validationErrors = validate(schema, document);

  if (validationErrors.length > 0) {
    throw validationErrors[0];
  }
  return async (
    args: Record<string, any>,
    context: KeystoneContext,
    rootValue: Record<string, string> = {}
  ) => {
    const result = await execute({
      schema,
      document,
      contextValue: context,
      variableValues: args,
      rootValue,
    });
    if (result.errors?.length) {
      throw result.errors[0];
    }
    return result.data![field.name][rawField];
  };
}
