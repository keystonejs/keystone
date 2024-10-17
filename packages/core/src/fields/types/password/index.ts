import bcryptjs from 'bcryptjs'
// @ts-expect-error
import dumbPasswords from 'dumb-passwords'
import { userInputError } from '../../../lib/core/graphql-errors'
import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
} from '../../../types'
import { graphql } from '../../..'
import { type PasswordFieldMeta } from './views'
import { makeValidateHook } from '../../non-null-graphql'
import { mergeFieldHooks } from '../../resolve-hooks'

export type PasswordFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    /**
     * @default 10
     */
    workFactor?: number
    validation?: {
      isRequired?: boolean
      rejectCommon?: boolean
      match?: { regex: RegExp, explanation?: string }
      length?: {
        /** @default 8 */
        min?: number
        max?: number
      }
    }
    db?: {
      isNullable?: boolean
      map?: string
      extendPrismaSchema?: (field: string) => string
    }
    bcrypt?: Pick<typeof bcryptjs, 'compare' | 'hash'>
  }

const PasswordState = graphql.object<{ isSet: boolean }>()({
  name: 'PasswordState',
  fields: {
    isSet: graphql.field({ type: graphql.nonNull(graphql.Boolean) }),
  },
})

const PasswordFilter = graphql.inputObject({
  name: 'PasswordFilter',
  fields: {
    isSet: graphql.arg({ type: graphql.nonNull(graphql.Boolean) }),
  },
})

const bcryptHashRegex = /^\$2[aby]?\$\d{1,2}\$[./A-Za-z0-9]{53}$/

export function password <ListTypeInfo extends BaseListTypeInfo> (config: PasswordFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  const {
    bcrypt = bcryptjs,
    workFactor = 10,
    validation = {},
  } = config
  const {
    isRequired = false,
    rejectCommon = false,
    match,
    length: {
      max
    } = {},
  } = validation
  const min = isRequired ? validation.length?.min ?? 8 : validation.length?.min

  return (meta) => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type password")
    }
    if (min !== undefined && (!Number.isInteger(min) || min < 0)) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.length.min: ${min} but it must be a positive integer`)
    }
    if (max !== undefined && (!Number.isInteger(max) || max < 0)) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.length.max: ${max} but it must be a positive integer`)
    }
    if (isRequired && min !== undefined && min === 0) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.isRequired: true and validation.length.min: 0, this is not allowed because validation.isRequired implies at least a min length of 1`)
    }
    if (isRequired && max !== undefined && max === 0) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.isRequired: true and validation.length.max: 0, this is not allowed because validation.isRequired implies at least a max length of 1`)
    }
    if (
      min !== undefined &&
      max !== undefined &&
      min > max
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies a validation.length.max that is less than the validation.length.min, and therefore has no valid options`)
    }
    if (workFactor < 6 || workFactor > 31 || !Number.isInteger(workFactor)) {
      throw new Error(`${meta.listKey}.${meta.fieldKey}: workFactor must be an integer between 6 and 31`)
    }

    function inputResolver (val: string | null | undefined) {
      if (val == null) return val
      return bcrypt.hash(val, workFactor)
    }

    const hasAdditionalValidation = match || rejectCommon || min !== undefined || max !== undefined
    const {
      mode,
      validate,
    } = makeValidateHook(meta, config, hasAdditionalValidation ? ({ inputData, operation, addValidationError }) => {
      if (operation === 'delete') return

      const value = inputData[meta.fieldKey] // we use inputData, as resolveData is hashed
      if (value != null) {
        if (min !== undefined && value.length < min) {
          if (min === 1) {
            addValidationError(`value must not be empty`)
          } else {
            addValidationError(`value must be at least ${min} characters long`)
          }
        }
        if (max !== undefined && value.length > max) {
          addValidationError(`value must be no longer than ${max} characters`)
        }
        if (match && !match.regex.test(value)) {
          addValidationError(match.explanation ?? `value must match ${match.regex}`)
        }
        if (rejectCommon && dumbPasswords.check(value)) {
          addValidationError(`value is too common and is not allowed`)
        }
      }
    } : undefined)

    return fieldType({
      kind: 'scalar',
      scalar: 'String',
      mode,
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      hooks: mergeFieldHooks({ validate }, config.hooks),
      input: {
        where:
          mode === 'required'
            ? undefined
            : {
                arg: graphql.arg({ type: PasswordFilter }),
                resolve (val) {
                  if (val === null) {
                    throw userInputError('Password filters cannot be set to null')
                  }
                  if (val.isSet) {
                    return {
                      not: null,
                    }
                  }
                  return null
                },
              },
        create: {
          arg: graphql.arg({ type: graphql.String }),
          resolve (val) {
            if (val === undefined) {
              return null
            }
            return inputResolver(val)
          },
        },
        update: {
          arg: graphql.arg({ type: graphql.String }),
          resolve: inputResolver,
        },
      },
      __ksTelemetryFieldTypeName: '@keystone-6/password',
      views: '@keystone-6/core/fields/types/password/views',
      getAdminMeta: (): PasswordFieldMeta => ({
        isNullable: mode === 'optional',
        validation: {
          isRequired,
          rejectCommon,
          match: match ? {
            regex: {
              source: match.regex.source,
              flags: match.regex.flags,
            },
            explanation: match.explanation ?? `value must match ${match.regex}`,
          } : null,
          length: {
            max: max ?? null,
            min: min ?? 8
          },
        },
      }),
      output: graphql.field({
        type: PasswordState,
        resolve (val) {
          return { isSet: val.value !== null && bcryptHashRegex.test(val.value) }
        },
        extensions: {
          keystoneSecretField: {
            generateHash: async (secret: string) => {
              return bcrypt.hash(secret, workFactor)
            },
            compare: (secret: string, hash: string) => {
              return bcrypt.compare(secret, hash)
            },
          },
        },
      }),
    })
  }
}
