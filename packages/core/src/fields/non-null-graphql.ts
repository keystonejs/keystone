import { type BaseListTypeInfo, type CommonFieldConfig, type FieldData } from '../types'

export function getResolvedIsNullable (
  validation: undefined | { isRequired?: boolean },
  db: undefined | { isNullable?: boolean }
): boolean {
  if (db?.isNullable === false) {
    return false
  }
  if (db?.isNullable === undefined && validation?.isRequired) {
    return false
  }
  return true
}

export function resolveHasValidation ({
  db,
  validation
}: {
  db?: { isNullable?: boolean },
  validation?: unknown,
}) {
  if (db?.isNullable === false) return true
  if (validation !== undefined) return true
  return false
}

export function assertReadIsNonNullAllowed<ListTypeInfo extends BaseListTypeInfo> (
  meta: FieldData,
  config: CommonFieldConfig<ListTypeInfo>,
  resolvedIsNullable: boolean
) {
  if (!resolvedIsNullable) return
  if (!config.graphql?.isNonNull?.read) return

  throw new Error(
    `The field at ${meta.listKey}.${meta.fieldKey} sets graphql.isNonNull.read: true, but not validation.isRequired: true, or db.isNullable: false\n` +
      `Set validation.isRequired: true, or db.isNullable: false, or graphql.isNonNull.read: false`
  )
}
