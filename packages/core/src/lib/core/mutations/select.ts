import type { GraphQLResolveInfo } from 'graphql/index.js'

import { addSelection } from '../../../types/item-selection.ts'
import { callbackReadsItemField } from '../../../types/item-callback.ts'
import type { InitialisedList } from '../initialise-lists.ts'
import { addCallbackFields, addItemField, selectFromInfoForList } from '../queries/select.ts'

type Operation = 'create' | 'update' | 'delete'
type Selection = Record<string, true> | undefined
type ConditionalSelection = {
  base: Selection
  byField: Map<string, Selection>
  missing: string[]
}
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

function applyConditionalSelection(
  plan: ConditionalSelection,
  inputData: Record<string, unknown>,
  selection: Readonly<Record<string, true>> = {}
) {
  const select = { ...selection }
  if (!addSelection(select, plan.base)) return undefined
  for (const fieldKey of Object.keys(inputData)) {
    if (plan.byField.has(fieldKey) && !addSelection(select, plan.byField.get(fieldKey)))
      return undefined
  }
  return select
}

/** The item read before an update or delete. */
export function selectExistingItem(
  list: InitialisedList,
  operation: 'update' | 'delete',
  inputData: Record<string, unknown>
) {
  return applyConditionalSelection(list.mutationSelections.existing[operation], inputData)
}

/** The item returned by Prisma after a create, update, or delete. */
export function selectMutationResult(
  list: InitialisedList,
  operation: Operation,
  inputData: Record<string, unknown>,
  info: GraphQLResolveInfo | undefined
) {
  const selection = info ? selectFromInfoForList(list, info) : { id: true as const }
  if (!selection) return undefined
  if (operation === 'delete') return selection
  return applyConditionalSelection(list.mutationSelections.result[operation], inputData, selection)
}

export function mutationSelections(list: InitialisedList): MutationSelections {
  const existing = (operation: 'update' | 'delete'): ConditionalSelection => {
    const base: Record<string, true> = { id: true }
    const missing: string[] = []
    let needsFullItem = !addCallbackFields(base, list.access.item[operation], list)
    if (needsFullItem) missing.push(`access.item.${operation}`)
    for (const hook of ['validate', 'beforeOperation', 'afterOperation'] as const) {
      const callback = list.hooks[hook][operation]
      if (!addHook(base, callback, list)) {
        needsFullItem = true
        missing.push(`hooks.${hook}.${operation}`)
      }
    }
    if (operation === 'update' && !addHook(base, list.hooks.resolveInput.update, list)) {
      needsFullItem = true
      missing.push('hooks.resolveInput.update')
    }
    const byField = new Map<string, Selection>()
    for (const [key, field] of Object.entries(list.fields)) {
      if (operation === 'update' && !addHook(base, field.hooks.resolveInput.update, list, key)) {
        needsFullItem = true
        missing.push(`fields.${key}.hooks.resolveInput.update`)
      }
      if (!addHook(base, field.hooks.validate[operation], list, key)) {
        needsFullItem = true
        missing.push(`fields.${key}.hooks.validate.${operation}`)
      }
      const conditional: Record<string, true> = {}
      let fieldNeedsFullItem = false
      if (operation === 'update' && !addCallbackFields(conditional, field.access.update, list)) {
        fieldNeedsFullItem = true
        missing.push(`fields.${key}.access.update`)
      }
      for (const hook of ['beforeOperation', 'afterOperation'] as const) {
        if (
          !addHook(
            operation === 'delete' ? base : conditional,
            field.hooks[hook][operation],
            list,
            key
          )
        ) {
          missing.push(`fields.${key}.hooks.${hook}.${operation}`)
          if (operation === 'delete') needsFullItem = true
          else fieldNeedsFullItem = true
        }
      }
      if (operation === 'update') byField.set(key, fieldNeedsFullItem ? undefined : conditional)
    }
    return { base: needsFullItem ? undefined : base, byField, missing }
  }
  const result = (operation: 'create' | 'update'): ConditionalSelection => {
    const base: Record<string, true> = {}
    const missing: string[] = []
    const baseFull = !addHook(base, list.hooks.afterOperation[operation], list)
    if (baseFull) missing.push(`hooks.afterOperation.${operation}`)
    const byField = new Map<string, Selection>()
    for (const [key, field] of Object.entries(list.fields)) {
      const selected: Record<string, true> = {}
      const declared = addHook(selected, field.hooks.afterOperation[operation], list, key)
      if (!declared) missing.push(`fields.${key}.hooks.afterOperation.${operation}`)
      byField.set(key, declared ? selected : undefined)
    }
    return { base: baseFull ? undefined : base, byField, missing }
  }
  return {
    existing: { update: existing('update'), delete: existing('delete') },
    result: { create: result('create'), update: result('update') },
  }
}
