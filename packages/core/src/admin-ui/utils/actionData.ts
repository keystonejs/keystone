import type { ActionMeta, FieldMeta, ListMeta } from '../../types'
import { makeDefaultValueState, serializeValueToOperationItem } from './utils'

export function getActionFieldArgFields(action: ActionMeta) {
  return Object.fromEntries(
    action.graphql.arguments.flatMap(arg => {
      const field = arg.source && 'field' in arg.source ? arg.source.field : undefined
      return field ? [[arg.name, field as FieldMeta]] : []
    })
  )
}

export function getActionArguments(
  list: ListMeta,
  action: ActionMeta,
  value: Record<string, unknown>,
  actionArgValue: Record<string, unknown> = {}
): Record<string, unknown> {
  const args: Record<string, unknown> = {}
  for (const arg of action.graphql.arguments) {
    const fieldSource = arg.source && 'field' in arg.source ? arg.source.field : undefined
    if (fieldSource) {
      const fields = { [arg.name]: fieldSource }
      const serialized = serializeValueToOperationItem(
        'create',
        fields,
        actionArgValue,
        makeDefaultValueState(fields)
      )
      if (Object.prototype.hasOwnProperty.call(serialized, arg.name)) {
        args[arg.name] = serialized[arg.name]
      }
      continue
    }
    const itemField = arg.source && 'itemField' in arg.source ? arg.source.itemField : undefined
    if (!itemField) continue

    const field = list.fields[itemField]
    if (!field) continue

    const serialized = serializeValueToOperationItem('update', { [itemField]: field }, value, {})
    if (Object.prototype.hasOwnProperty.call(serialized, itemField)) {
      args[arg.name] = serialized[itemField]
    }
  }
  return args
}

export function getActionGraphQLArgs(action: ActionMeta): string {
  return action.graphql.arguments.map(arg => `${arg.name}: $${arg.name}`).join(', ')
}

export function getActionGraphQLVariables(action: ActionMeta): string {
  return action.graphql.arguments.map(arg => `$${arg.name}: ${arg.type}`).join(', ')
}
