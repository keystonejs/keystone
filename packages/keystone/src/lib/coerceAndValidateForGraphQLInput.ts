import {
  GraphQLSchema,
  VariableDefinitionNode,
  TypeNode,
  GraphQLType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
  ListTypeNode,
  NamedTypeNode,
  GraphQLInputType,
  GraphQLError,
} from 'graphql';
import { getVariableValues } from 'graphql/execution/values';

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

const argName = 'where';

export function coerceAndValidateForGraphQLInput(
  schema: GraphQLSchema,
  type: GraphQLInputType,
  value: any
): { kind: 'valid'; value: any } | { kind: 'error'; error: GraphQLError } {
  const variableDefintions: VariableDefinitionNode[] = [
    {
      kind: 'VariableDefinition',
      type: getTypeNodeForType(type),
      variable: { kind: 'Variable', name: { kind: 'Name', value: argName } },
    },
  ];

  const coercedVariableValues = getVariableValues(schema, variableDefintions, {
    [argName]: value,
  });
  if (coercedVariableValues.errors) {
    return { kind: 'error', error: coercedVariableValues.errors[0] };
  }
  return { kind: 'valid', value: coercedVariableValues.coerced[argName] };
}
