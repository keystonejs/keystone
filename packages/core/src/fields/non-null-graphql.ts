import { type BaseListTypeInfo, type FieldData } from '../types'
import type { FieldHooks } from '../types/config/hooks'
import { type ValidateFieldHook } from '../types/config/hooks'
import { merge } from './resolve-hooks'

export function resolveDbNullable(
  validation: undefined | { isRequired?: boolean },
  db: undefined | { isNullable?: boolean }
): boolean {
  if (db?.isNullable === false) return false
  if (db?.isNullable === undefined && validation?.isRequired) {
    return false
  }
  return true
}

export function makeValidateHook<ListTypeInfo extends BaseListTypeInfo>(
  meta: FieldData<ListTypeInfo>,
  config: {
    label?: string
    db?: {
      isNullable?: boolean
    }
    graphql?: {
      isNonNull?:
        | boolean
        | {
            read?: boolean
          }
    }
    validation?: {
      isRequired?: boolean
      [key: string]: unknown
    }
    hooks?: {
      validate?: FieldHooks<ListTypeInfo>['validate']
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
          (operation === 'create' && value === undefined) ||
          ((operation === 'create' || operation === 'update') && value === null)
        ) {
          addValidationError(`missing value`)
        }
      }

      await f?.(args)
    } satisfies ValidateFieldHook<
      ListTypeInfo,
      'create' | 'update' | 'delete',
      ListTypeInfo['fields']
    >

    return {
      mode,
      validate: merge(validate, config.hooks?.validate),
    }
  }

  return {
    mode,
    validate: merge(f, config.hooks?.validate),
  }
}

export function assertReadIsNonNullAllowed<ListTypeInfo extends BaseListTypeInfo>(
  meta: FieldData<ListTypeInfo>,
  config: {
    graphql?: {
      isNonNull?:
        | boolean
        | {
            read?: boolean
          }
    }
  },
  dbNullable: boolean
) {
  if (!dbNullable) return
  if (!config.graphql?.isNonNull) return
  if (typeof config.graphql?.isNonNull === 'object' && !config.graphql.isNonNull.read) return

  throw new Error(
    `${meta.listKey}.${meta.fieldKey} sets graphql.isNonNull.read: true, but not validation.isRequired: true (or db.isNullable: false)\n` +
      `Set validation.isRequired: true, or db.isNullable: false, or graphql.isNonNull.read: false`
  )
}
