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
  GraphQLFieldConfig,
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
    [rawField]: {
      type: RawScalar,
      resolve(rootVal) {
        return rootVal;
      },
    },
  },
});

type AddUndefinedIfExtendsUndefinedOnOther<
  Source extends Record<Key, any>,
  T extends Record<string, any>,
  Key extends keyof T = keyof T
> = {
  [K in Key]: T[K] | Source[K];
};

type RequiredButStillAllowUndefined<
  T extends Record<string, any>
> = AddUndefinedIfExtendsUndefinedOnOther<T, Required<T>>;

function argsToArgsConfig(args: GraphQLArgument[]) {
  return Object.fromEntries(
    args.map(arg => {
      const argConfig: RequiredButStillAllowUndefined<GraphQLArgumentConfig> = {
        astNode: arg.astNode,
        defaultValue: arg.defaultValue,
        deprecationReason: arg.deprecationReason,
        description: arg.description,
        extensions: arg.extensions,
        type: arg.type,
      };
      return [arg.name, argConfig];
    })
  );
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

  const fieldConfig: RequiredButStillAllowUndefined<GraphQLFieldConfig<any, any>> = {
    args: argsToArgsConfig(field.args),
    astNode: undefined,
    deprecationReason: field.deprecationReason,
    description: field.description,
    extensions: field.extensions,
    resolve: field.resolve,
    subscribe: field.subscribe,
    type: ReturnRawValueObjectType,
  };
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        [field.name]: fieldConfig,
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
