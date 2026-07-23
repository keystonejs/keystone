import type {
  GraphQLError,
  GraphQLInputType,
  GraphQLSchema,
  VariableDefinitionNode,
} from 'graphql/index.js'
import { Kind } from 'graphql/index.js'
import { getVariableValues } from 'graphql/execution/values.js'

import { getTypeNodeForType } from './context/graphql'

const argName = 'where'

export function coerceAndValidateForGraphQLInput(
  schema: GraphQLSchema,
  type: GraphQLInputType,
  value: any
): { kind: 'valid'; value: any } | { kind: 'error'; error: GraphQLError } {
  const variableDefintions: VariableDefinitionNode[] = [
    {
      kind: Kind.VARIABLE_DEFINITION,
      type: getTypeNodeForType(type),
      variable: { kind: Kind.VARIABLE, name: { kind: Kind.NAME, value: argName } },
    },
  ]

  const coercedVariableValues = getVariableValues(schema, variableDefintions, {
    [argName]: value,
  })
  if (coercedVariableValues.errors) {
    return { kind: 'error', error: coercedVariableValues.errors[0] }
  }
  return { kind: 'valid', value: coercedVariableValues.coerced[argName] }
}
