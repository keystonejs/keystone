import { useMemo } from 'react'
import isDeepEqual from 'fast-deep-equal'
import type { FieldMeta } from '../../../types'
import { type FragmentDefinitionNode, type SelectionSetNode, parse } from 'graphql'
import type { BaseListTypeInfo, ConditionalFieldFilterCase, FieldController } from '../../types'
import { testFilter } from './Fields'

function extractRootFields(selectedFields: Set<string>, selectionSet: SelectionSetNode) {
  selectionSet.selections.forEach(selection => {
    if (selection.kind === 'Field') {
      selectedFields.add(selection.alias ? selection.alias.value : selection.name.value)
    }
    if (selection.kind === 'InlineFragment') {
      extractRootFields(selectedFields, selection.selectionSet)
    }
    // FragmentSpread will never happen for the use cases of getRootFieldsFromSelection
  })
}

export function getRootGraphQLFieldsFromFieldController(controller: FieldController<any, any>) {
  const ast = parse(`fragment X on Y { id, ${controller.graphqlSelection} }`)
  const selectedFields = new Set<string>()
  const fragmentNode = ast.definitions[0] as FragmentDefinitionNode
  extractRootFields(selectedFields, fragmentNode.selectionSet)
  return [...selectedFields]
}

export function useInvalidFields(
  fields: Record<string, FieldMeta>,
  item: Record<string, unknown>,
  isRequireds: Record<string, ConditionalFieldFilterCase<BaseListTypeInfo>>
): ReadonlySet<string> {
  return useMemo(() => {
    const invalidFields = new Set<string>()
    const serialized: Record<string, unknown> = {}
    for (const [fieldKey, field] of Object.entries(fields)) {
      Object.assign(serialized, field.controller.serialize(item[fieldKey]))
    }

    for (const fieldKey in item) {
      const validateFn = fields[fieldKey]?.controller?.validate
      if (!validateFn) continue
      const isRequired = testFilter(isRequireds[fieldKey] ?? false, serialized)
      const fieldValue = item[fieldKey]
      const valid = validateFn(fieldValue, { isRequired })
      if (valid) continue

      invalidFields.add(fieldKey)
    }
    return invalidFields
  }, [fields, isRequireds, item])
}

export function makeDefaultValueState(fields: Record<string, FieldMeta>) {
  const result: Record<string, unknown> = {}
  for (const fieldKey in fields) {
    result[fieldKey] = fields[fieldKey].controller.defaultValue
  }
  return result
}

export function deserializeItemToValue(
  fields: Record<string, FieldMeta>,
  item: Record<string, unknown | null>
) {
  const result: Record<string, unknown | null> = {}
  for (const fieldKey in fields) {
    const field = fields[fieldKey]
    const itemForField: Record<string, unknown> = {}
    for (const graphqlField of getRootGraphQLFieldsFromFieldController(field.controller)) {
      itemForField[graphqlField] = item?.[graphqlField] ?? null
    }
    result[fieldKey] = field.controller.deserialize(itemForField)
  }
  return result
}

export function serializeValueToOperationItem(
  operation: 'create' | 'update',
  fields: Record<string, FieldMeta>,
  value: Record<string, unknown>,
  valueReference?: Record<string, unknown>
) {
  const result: Record<string, unknown> = {}
  valueReference ??= makeDefaultValueState(fields)

  for (const fieldKey in fields) {
    const field = fields[fieldKey]

    const fieldValue = value[fieldKey]
    const fieldValueSerialized = field.controller.serialize(fieldValue)

    const fieldValueReference = valueReference[fieldKey]

    const isAlwaysRequired = field.graphql.isNonNull.includes(operation)
    if (!isAlwaysRequired) {
      if (isDeepEqual(fieldValueSerialized, field.controller.serialize(fieldValueReference)))
        continue
    }

    Object.assign(result, fieldValueSerialized)
  }

  return result
}

export function useHasChanges(
  operation: 'create' | 'update',
  fields: Record<string, FieldMeta>,
  value: Record<string, unknown>,
  valueReference?: Record<string, unknown>
) {
  return useMemo(() => {
    const alwaysRequiredCount = Object.values(fields).filter(f =>
      f.graphql.isNonNull.includes(operation)
    ).length

    const itemForUpdate = serializeValueToOperationItem(operation, fields, value, valueReference)

    // add any fields that are always required
    return Object.keys(itemForUpdate).length - alwaysRequiredCount > 0
  }, [fields, operation, value, valueReference])
}
