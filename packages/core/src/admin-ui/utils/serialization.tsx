import {
  type ControllerValue,
  type GraphQLValue,
  type FieldMeta
} from '../../types'

export {
  type ControllerValue,
  type GraphQLValue
} from '../../types'

export function getDefaultControllerValue (fields: Record<string, FieldMeta>) {
  const defaults: ControllerValue = {}
  for (const field of Object.values(fields)) {
    defaults[field.path] = field.controller.defaultValue
  }
  return defaults
}

export function getInvalidFields (
  fields: Record<string, FieldMeta>,
  value: ControllerValue
): ReadonlySet<string> {
  const invalidFields = new Set<string>()

  for (const field of Object.values(fields)) {
    const fieldValue = value[field.path]
    if (field.controller.validate?.(fieldValue) === false) {
      invalidFields.add(field.path)
    }
  }

  return invalidFields
}

// TODO: revert to deserializeValue naming?
export function graphQLValueToController (
  fields: Record<string, FieldMeta>,
  value: GraphQLValue
) {
  const result: ControllerValue = {}
  for (const field of Object.values(fields)) {
    result[field.path] = field.controller.deserialize(value)
    console.error(field.path, result[field.path], value[field.path])
  }
  return result
}

// TODO: revert to serializeValueToObjByFieldKey naming?
export function controllerToGraphQLValue (
  fields: Record<string, FieldMeta>,
  state: ControllerValue
) {
  const result: GraphQLValue = {}
  for (const field of Object.values(fields)) {
    if (field.path === 'id') continue // cannot be used
    result[field.path] = field.controller.serialize(state[field.path])?.[field.path]
  }
  return result
}
