import type { ListMeta, ActionMeta } from '../../types'
import { pick } from './pick'
import { serializeValueToOperationItem } from './utils'

export function serializeActionData(
  list: ListMeta,
  action: ActionMeta,
  value: Record<string, unknown>,
  initialValue: Record<string, unknown>
): Record<string, unknown> {
  const fields = pick(list.fields, action.graphql.fields)
  const pickedInitialValue = pick(initialValue, action.graphql.fields)
  const pickedValue = pick(value, action.graphql.fields)
  return serializeValueToOperationItem('update', fields, pickedValue, pickedInitialValue)
}
