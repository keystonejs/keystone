import {
  GraphQLField,
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
  FieldNode,
} from 'graphql';
import { getArgumentValues, getVariableValues } from 'graphql/execution/values';

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

export function getCoerceAndValidateArgumentsFnForGraphQLField(
  schema: GraphQLSchema,
  field?: GraphQLField<any, any>
) {
  if (!field) return;
  const variableDefintions: VariableDefinitionNode[] = [];

  for (const arg of field.args) {
    variableDefintions.push({
      kind: 'VariableDefinition',
      type: getTypeNodeForType(arg.type),
      variable: { kind: 'Variable', name: { kind: 'Name', value: `${arg.name}` } },
    });
  }

  const fieldNode: FieldNode = {
    kind: 'Field',
    name: { kind: 'Name', value: field.name },
    arguments: field.args.map(arg => ({
      kind: 'Argument',
      name: { kind: 'Name', value: arg.name },
      value: { kind: 'Variable', name: { kind: 'Name', value: `${arg.name}` } },
    })),
  };
  return (args: Record<string, any>) => {
    const coercedVariableValues = getVariableValues(schema, variableDefintions, args);
    if (coercedVariableValues.errors) {
      throw coercedVariableValues.errors[0];
    }
    return getArgumentValues(field, fieldNode, coercedVariableValues.coerced);
  };
}
