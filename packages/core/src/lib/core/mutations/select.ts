import type { GraphQLResolveInfo } from 'graphql/index.js'

import { callbackReadsItemField } from '../../../types/item-callback.ts'
import type { InitialisedList } from '../initialise-lists.ts'
import { addCallbackFields, addItemField, addSelection, selectFromInfo } from '../queries/select.ts'

type Operation = 'create' | 'update' | 'delete'
type Selection = Record<string, true> | undefined
type ConditionalSelection = { base: Selection; byField: Map<string, Selection> }
export type MutationSelections = {
  existing: Record<'update' | 'delete', ConditionalSelection>
  result: Record<'create' | 'update', ConditionalSelection>
}

function addHook(
  select: Record<string, true>,
  callback: Function,
  list: InitialisedList,
  fieldKey?: string
) {
  if (!addCallbackFields(select, callback, list)) return false
  if (fieldKey && callbackReadsItemField(callback)) {
    return addItemField(select, fieldKey, list)
  }
  return true
}

/** The item read before an update or delete. */
export function selectExistingItem(
  list: InitialisedList,
  operation: 'update' | 'delete',
  inputData: Record<string, unknown>
) {
  const plan = list.mutationSelections.existing[operation]
  if (!plan.base) return undefined
  const select = { ...plan.base }
  for (const fieldKey of Object.keys(inputData)) {
    if (plan.byField.has(fieldKey) && !addSelection(select, plan.byField.get(fieldKey)))
      return undefined
  }
  return select
}

/** The item returned by Prisma after a create, update, or delete. */
export function selectMutationResult(
  list: InitialisedList,
  operation: Operation,
  inputData: Record<string, unknown>,
  info: GraphQLResolveInfo
) {
  const select = selectFromInfo(list, info)
  if (!select) return undefined
  if (operation === 'delete') return select
  const plan = list.mutationSelections.result[operation]
  if (!addSelection(select, plan.base)) return undefined
  for (const fieldKey of Object.keys(inputData)) {
    if (plan.byField.has(fieldKey) && !addSelection(select, plan.byField.get(fieldKey)))
      return undefined
  }
  return select
}

export function mutationSelections(list: InitialisedList): MutationSelections {
  const existing = (operation: 'update' | 'delete'): ConditionalSelection => {
    const base: Record<string, true> = { id: true }
    let needsFullItem = !addCallbackFields(base, list.access.item[operation], list)
    for (const callback of [
      list.hooks.validate[operation],
      list.hooks.beforeOperation[operation],
      list.hooks.afterOperation[operation],
      ...(operation === 'update' ? [list.hooks.resolveInput.update] : []),
    ]) {
      if (!addHook(base, callback, list)) needsFullItem = true
    }
    const byField = new Map<string, Selection>()
    for (const [key, field] of Object.entries(list.fields)) {
      if (operation === 'update' && !addHook(base, field.hooks.resolveInput.update, list, key)) {
        needsFullItem = true
      }
      if (!addHook(base, field.hooks.validate[operation], list, key)) needsFullItem = true
      const conditional: Record<string, true> = {}
      let fieldNeedsFullItem = false
      if (operation === 'update' && !addCallbackFields(conditional, field.access.update, list)) {
        fieldNeedsFullItem = true
      }
      for (const hook of [
        field.hooks.beforeOperation[operation],
        field.hooks.afterOperation[operation],
      ]) {
        if (!addHook(operation === 'delete' ? base : conditional, hook, list, key)) {
          if (operation === 'delete') needsFullItem = true
          else fieldNeedsFullItem = true
        }
      }
      if (operation === 'update') byField.set(key, fieldNeedsFullItem ? undefined : conditional)
    }
    return { base: needsFullItem ? undefined : base, byField }
  }
  const result = (operation: 'create' | 'update'): ConditionalSelection => {
    const base: Record<string, true> = {}
    const baseFull = !addHook(base, list.hooks.afterOperation[operation], list)
    const byField = new Map<string, Selection>()
    for (const [key, field] of Object.entries(list.fields)) {
      const selected: Record<string, true> = {}
      byField.set(
        key,
        addHook(selected, field.hooks.afterOperation[operation], list, key) ? selected : undefined
      )
    }
    return { base: baseFull ? undefined : base, byField }
  }
  return {
    existing: { update: existing('update'), delete: existing('delete') },
    result: { create: result('create'), update: result('update') },
  }
}
