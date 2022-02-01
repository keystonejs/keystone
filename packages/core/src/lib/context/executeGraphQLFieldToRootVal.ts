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
  GraphQLOutputType,
  astFromValue,
} from 'graphql';
import { KeystoneContext } from '../../types';

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

export function getTypeNodeForType(type: GraphQLType): TypeNode {
  if (type instanceof GraphQLNonNull) {
    return { kind: 'NonNullType', type: getNamedOrListTypeNodeForType(type.ofType) };
  }
  return getNamedOrListTypeNodeForType(type);
}

export function getVariablesForGraphQLField(field: GraphQLField<any, any>) {
  const variableDefinitions: VariableDefinitionNode[] = field.args.map(arg => ({
    kind: 'VariableDefinition',
    type: getTypeNodeForType(arg.type),
    variable: { kind: 'Variable', name: { kind: 'Name', value: arg.name } },
    defaultValue:
      arg.defaultValue === undefined
        ? undefined
        : astFromValue(arg.defaultValue, arg.type) ?? undefined,
  }));

  const argumentNodes: ArgumentNode[] = field.args.map(arg => ({
    kind: 'Argument',
    name: { kind: 'Name', value: arg.name },
    value: { kind: 'Variable', name: { kind: 'Name', value: arg.name } },
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

type RequiredButStillAllowUndefined<
  T extends Record<string, any>,
  // this being a param is important and is what makes this work,
  // please do not move it inside the mapped type.
  // i can't find a place that explains this but the tldr is that
  // having the keyof T _inside_ the mapped type means TS will keep modifiers
  // like readonly and optionality and we want to remove those here
  Key extends keyof T = keyof T
> = {
  [K in Key]: T[K];
};

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

type OutputTypeWithoutNonNull = GraphQLObjectType | GraphQLList<OutputType>;

type OutputType = OutputTypeWithoutNonNull | GraphQLNonNull<OutputTypeWithoutNonNull>;

// note the GraphQLNonNull and GraphQLList constructors are incorrectly
// not generic over their inner type which is why we have to use as
// (the classes are generic but not the constructors)
function getTypeForField(originalType: GraphQLOutputType): OutputType {
  if (originalType instanceof GraphQLNonNull) {
    return new GraphQLNonNull(getTypeForField(originalType.ofType)) as OutputType;
  }
  if (originalType instanceof GraphQLList) {
    return new GraphQLList(getTypeForField(originalType.ofType)) as OutputType;
  }
  return ReturnRawValueObjectType;
}

function getRootValGivenOutputType(originalType: OutputType, value: any): any {
  if (originalType instanceof GraphQLNonNull) {
    return getRootValGivenOutputType(originalType.ofType, value);
  }
  if (value === null) return null;
  if (originalType instanceof GraphQLList) {
    return value.map((x: any) => getRootValGivenOutputType(originalType.ofType, x));
  }
  return value[rawField];
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

  const type = getTypeForField(field.type);

  const fieldConfig: RequiredButStillAllowUndefined<GraphQLFieldConfig<any, any>> = {
    args: argsToArgsConfig(field.args),
    astNode: undefined,
    deprecationReason: field.deprecationReason,
    description: field.description,
    extensions: field.extensions,
    resolve: field.resolve,
    subscribe: field.subscribe,
    type,
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
    return getRootValGivenOutputType(type, result.data![field.name]);
  };
}
