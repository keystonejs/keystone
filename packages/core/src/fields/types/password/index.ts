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

const bcryptHashRegex = /^\$2[aby]?\$\d{1,2}\$[.\/A-Za-z0-9]{53}$/

export function password <ListTypeInfo extends BaseListTypeInfo>(config: PasswordFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  const {
    bcrypt = bcryptjs,
    workFactor = 10,
    validation: _validation,
  } = config

  return (meta) => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type password")
    }

    const validation = {
      isRequired: _validation?.isRequired ?? false,
      rejectCommon: _validation?.rejectCommon ?? false,
      match: _validation?.match
        ? {
            regex: _validation.match.regex,
            explanation: _validation.match.explanation ?? `value must match ${_validation.match.regex}`,
          }
        : null,
      length: {
        min: _validation?.length?.min ?? 8,
        max: _validation?.length?.max ?? null,
      },
    }

    for (const type of ['min', 'max'] as const) {
      const val = validation.length[type]
      if (val !== null && (!Number.isInteger(val) || val < 1)) {
        throw new Error(`${meta.listKey}.${meta.fieldKey}: validation.length.${type} must be a positive integer >= 1`)
      }
    }

    if (validation.length.max !== null && validation.length.min > validation.length.max) {
      throw new Error(`${meta.listKey}.${meta.fieldKey}: validation.length.max cannot be less than validation.length.min`)
    }

    if (workFactor < 6 || workFactor > 31 || !Number.isInteger(workFactor)) {
      throw new Error(`${meta.listKey}.${meta.fieldKey}: workFactor must be an integer between 6 and 31`)
    }

    function inputResolver (val: string | null | undefined) {
      if (val == null) return val
      return bcrypt.hash(val, workFactor)
    }

    const {
      mode,
      validate,
    } = makeValidateHook(meta, config, ({ resolvedData, operation, addValidationError }) => {
      if (operation === 'delete') return

      const value = resolvedData[meta.fieldKey]
      if (value != null) {
        if (value.length < validation.length.min) {
          if (validation.length.min === 1) {
            addValidationError(`value must not be empty`)
          } else {
            addValidationError(`value must be at least ${validation.length.min} characters long`)
          }
        }
        if (validation.length.max !== null && value.length > validation.length.max) {
          addValidationError(`Value must be no longer than ${validation.length.max} characters`)
        }
        if (validation.match && !validation.match.regex.test(value)) {
          addValidationError(validation.match.explanation)
        }
        if (validation.rejectCommon && dumbPasswords.check(value)) {
          addValidationError(`Value is too common and is not allowed`)
        }
      }
    })

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
          ...validation,
          match: validation.match
            ? {
                regex: {
                  source: validation.match.regex.source,
                  flags: validation.match.regex.flags,
                },
                explanation: validation.match.explanation,
              }
            : null,
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
