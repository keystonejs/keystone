import {
  type BaseListTypeInfo,
  type FieldData,
} from '../types'
import {
  type ValidateFieldHook
} from '../types/config/hooks'

export function getResolvedIsNullable (
  validation: undefined | { isRequired?: boolean },
  db: undefined | { isNullable?: boolean }
): boolean {
  if (db?.isNullable === false) return false
  if (db?.isNullable === undefined && validation?.isRequired) {
    return false
  }
  return true
}

function resolveHasValidation (
  db?: { isNullable?: boolean },
  validation?: unknown
) {
  if (db?.isNullable === false) return true
  if (validation !== undefined) return true
  return false
}

export function makeValidateHook <ListTypeInfo extends BaseListTypeInfo> (
  meta: FieldData,
  config: {
    label?: string,
    db?: {
      isNullable?: boolean
    },
    graphql?: {
      isNonNull?: {
        read?: boolean
      }
    },
    validation?: {
      isRequired?: boolean
    },
  },
  f?: ValidateFieldHook<ListTypeInfo, 'create' | 'update' | 'delete', ListTypeInfo['fields']>
) {
  const resolvedIsNullable = getResolvedIsNullable(config.validation, config.db)
  const mode = resolvedIsNullable === false ? ('required' as const) : ('optional' as const)

  assertReadIsNonNullAllowed(meta, config, resolvedIsNullable)
  const hasValidation = resolveHasValidation(config.db, config.validation)
  if (hasValidation) {
    const validate = async function (args) {
      const { operation, addValidationError, resolvedData } = args
      if (operation !== 'delete') {
        const value = resolvedData[meta.fieldKey]
        if ((config.validation?.isRequired || resolvedIsNullable === false) && value === null) {
          addValidationError(`Missing value`)
        }
      }

      await f?.(args)
    } satisfies ValidateFieldHook<ListTypeInfo, 'create' | 'update' | 'delete', ListTypeInfo['fields']>

    return {
      mode,
      validate,
    }
  }

  return {
    mode,
    validate: undefined
  }
}

export function assertReadIsNonNullAllowed<ListTypeInfo extends BaseListTypeInfo> (
  meta: FieldData,
  config: {
    graphql?: {
      isNonNull?: {
        read?: boolean
      }
    }
  },
  resolvedIsNullable: boolean
) {
  if (!resolvedIsNullable) return
  if (!config.graphql?.isNonNull?.read) return

  throw new Error(
    `The field at ${meta.listKey}.${meta.fieldKey} sets graphql.isNonNull.read: true, but not validation.isRequired: true, or db.isNullable: false\n` +
      `Set validation.isRequired: true, or db.isNullable: false, or graphql.isNonNull.read: false`
  )
}
