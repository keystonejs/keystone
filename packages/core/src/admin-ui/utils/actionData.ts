import type { ListMeta, ActionMeta } from '../../types'
import { serializeValueToOperationItem } from './utils'

export function getActionArguments(
  list: ListMeta,
  action: ActionMeta,
  value: Record<string, unknown>
): Record<string, unknown> {
  const args: Record<string, unknown> = {}
  for (const arg of action.graphql.arguments) {
    const source = arg.source
    if (!source) continue

    const field = list.fields[source.itemField]
    if (!field) continue

    const serialized = serializeValueToOperationItem('update', { [source.itemField]: field }, value, {})
    if (Object.prototype.hasOwnProperty.call(serialized, source.itemField)) {
      args[arg.name] = serialized[source.itemField]
    }
  }
  return args
}

export function hasActionArgSources(action: ActionMeta): boolean {
  return action.graphql.arguments.every(arg => arg.source !== null)
}

export function getActionGraphQLArgs(action: ActionMeta): string {
  return action.graphql.arguments.map(arg => `${arg.name}: $${arg.name}`).join(', ')
}

export function getActionGraphQLVariables(action: ActionMeta): string {
  return action.graphql.arguments.map(arg => `$${arg.name}: ${arg.type}`).join(', ')
}
