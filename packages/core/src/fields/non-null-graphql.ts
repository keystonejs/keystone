import {
  type BaseListTypeInfo,
  type FieldData,
} from '../types'
import {
  type ValidateFieldHook
} from '../types/config/hooks'

export function resolveDbNullable (
  validation: undefined | { isRequired?: boolean },
  db: undefined | { isNullable?: boolean }
): boolean {
  if (db?.isNullable === false) return false
  if (db?.isNullable === undefined && validation?.isRequired) {
    return false
  }
  return true
}

export function makeValidateHook <ListTypeInfo extends BaseListTypeInfo> (
  meta: FieldData,
  config: {
    label?: string
    db?: {
      isNullable?: boolean
    }
    graphql?: {
      isNonNull?: {
        read?: boolean
      }
    }
    validation?: {
      isRequired?: boolean
      [key: string]: unknown
    }
  },
  f?: ValidateFieldHook<ListTypeInfo, 'create' | 'update' | 'delete', ListTypeInfo['fields']>
) {
  const dbNullable = resolveDbNullable(config.validation, config.db)
  const mode = dbNullable ? ('optional' as const) : ('required' as const)
  const valueRequired = config.validation?.isRequired || !dbNullable

  assertReadIsNonNullAllowed(meta, config, dbNullable)
  const addValidation = config.db?.isNullable === false || config.validation?.isRequired
  if (addValidation) {
    const validate = async function (args) {
      const { operation, addValidationError, resolvedData } = args

      if (valueRequired) {
        const value = resolvedData?.[meta.fieldKey]
        if (
            (operation === 'create' && value === undefined)
        || ((operation === 'create' || operation === 'update') && (value === null))
        ) {
          addValidationError(`missing value`)
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
    validate: f
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
  dbNullable: boolean
) {
  if (!dbNullable) return
  if (!config.graphql?.isNonNull?.read) return

  throw new Error(
    `${meta.listKey}.${meta.fieldKey} sets graphql.isNonNull.read: true, but not validation.isRequired: true (or db.isNullable: false)\n` +
      `Set validation.isRequired: true, or db.isNullable: false, or graphql.isNonNull.read: false`
  )
}
