import { GraphQLSchema, VariableDefinitionNode, GraphQLInputType, GraphQLError } from 'graphql';
import { getVariableValues } from 'graphql/execution/values';
import { getTypeNodeForType } from './context/executeGraphQLFieldToRootVal';

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
