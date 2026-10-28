import bcryptjs from 'bcryptjs'
import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
} from '@keystone-6/core/types'
import { g, selectItem } from '@keystone-6/core'
import { GraphQLError, isObjectType, type GraphQLSchema } from 'graphql/index.js'
import type { controller } from './views/index.tsx'

type FieldTypeInfo = {
  item: string | null
  inputs: {
    where: { isSet: boolean } | null | undefined
    create: string | null | undefined
    update: string | null | undefined
    uniqueWhere: never
    orderBy: never
  }
  prisma: {
    create: string | null | undefined
    update: string | null | undefined
  }
}

export type PasswordFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  FieldTypeInfo
> & {
  validation?: {
    isRequired?: boolean
    match?: { regex: RegExp; explanation?: string }
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
  kdf?: KDF
}

type KDF = {
  compare(preImage: string, hash: string): Promise<boolean>
  hash(preImage: string): Promise<string>
}

const PasswordState = g.object<{ isSet: boolean }>()({
  name: 'PasswordState',
  fields: {
    isSet: g.field({ type: g.nonNull(g.Boolean) }),
  },
})

const PasswordFilter = g.inputObject({
  name: 'PasswordFilter',
  fields: {
    isSet: g.arg({ type: g.nonNull(g.Boolean) }),
  },
})

export function password<ListTypeInfo extends BaseListTypeInfo>(
  config: PasswordFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  const {
    kdf = {
      hash: secret => {
        // note this is slightly different to checking .length > 72 because
        // bcrypt will truncate to 72 bytes after utf8 encoding
        // not JS string length which may be different since that's the utf16 length
        // (though using characters in the error message makes sense since users shouldn't have to think about bytes and it aligns with the validation messages below)
        if (bcryptjs.truncates(secret))
          throw new Error('value must be no longer than 72 characters')
        return bcryptjs.hash(secret, 10)
      },
      compare: (secret, hash) => bcryptjs.compare(secret, hash),
    },
    validation = {},
  } = config
  const { isRequired = false, match, length: { max } = {} } = validation
  const min = isRequired ? (validation.length?.min ?? 8) : validation.length?.min

  return meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type password")
    }
    if (min !== undefined && (!Number.isInteger(min) || min < 0)) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies validation.length.min: ${min} but it must be a positive integer`
      )
    }
    if (max !== undefined && (!Number.isInteger(max) || max < 0)) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies validation.length.max: ${max} but it must be a positive integer`
      )
    }
    if (isRequired && min !== undefined && min === 0) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies validation.isRequired: true and validation.length.min: 0, this is not allowed because validation.isRequired implies at least a min length of 1`
      )
    }
    if (isRequired && max !== undefined && max === 0) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies validation.isRequired: true and validation.length.max: 0, this is not allowed because validation.isRequired implies at least a max length of 1`
      )
    }
    if (min !== undefined && max !== undefined && min > max) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies a validation.length.max that is less than the validation.length.min, and therefore has no valid options`
      )
    }

    function inputResolver(val: string | null | undefined) {
      if (val == null) return val
      return kdf.hash(val)
    }

    const isNullable = config.db?.isNullable ?? !isRequired
    const mode = isNullable ? 'optional' : 'required'
    const readIsNonNull =
      typeof config.graphql?.isNonNull === 'object'
        ? config.graphql.isNonNull.read
        : config.graphql?.isNonNull
    if (isNullable && readIsNonNull) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} sets graphql.isNonNull.read: true, but not validation.isRequired: true (or db.isNullable: false)\n` +
          `Set validation.isRequired: true, or db.isNullable: false, or graphql.isNonNull.read: false`
      )
    }

    type ValidateHooks = Exclude<
      NonNullable<NonNullable<PasswordFieldConfig<ListTypeInfo>['hooks']>['validate']>,
      Function
    >
    type ValidateArgs = Parameters<NonNullable<ValidateHooks['create' | 'update']>>[0]
    function wrapValidate<Args extends ValidateArgs>(
      hook: ((args: Args) => void | Promise<void>) | undefined
    ) {
      return selectItem.wrap(
        hook => async args => {
          const { operation, inputData, resolvedData, addValidationError } = args
          const resolvedValue = resolvedData[meta.fieldKey]
          if (
            (isRequired || !isNullable) &&
            ((operation === 'create' && resolvedValue === undefined) || resolvedValue === null)
          ) {
            addValidationError('missing value')
          }

          // Validate the input because resolvedData contains the hashed password.
          const value = inputData[meta.fieldKey]
          if (value != null) {
            if (min !== undefined && value.length < min) {
              addValidationError(
                min === 1
                  ? 'value must not be empty'
                  : `value must be at least ${min} characters long`
              )
            }
            if (max !== undefined && value.length > max) {
              addValidationError(`value must be no longer than ${max} characters`)
            }
            if (match && !match.regex.test(value)) {
              addValidationError(match.explanation ?? `value must match ${match.regex}`)
            }
          }
          await hook?.(args)
        },
        {},
        hook
      )
    }
    const validate = config.hooks?.validate

    return fieldType({
      kind: 'scalar',
      scalar: 'String',
      mode,
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      ui: {
        ...config.ui,
        createView: {
          ...config.ui?.createView,
          isRequired: config.ui?.createView?.isRequired ?? isRequired,
        },
        itemView: {
          ...config.ui?.itemView,
          isRequired: config.ui?.itemView?.isRequired ?? isRequired,
        },
      },
      hooks: {
        ...config.hooks,
        validate: {
          create: wrapValidate(typeof validate === 'function' ? validate : validate?.create),
          update: wrapValidate(typeof validate === 'function' ? validate : validate?.update),
          delete: typeof validate === 'function' ? validate : validate?.delete,
        },
      },
      input: {
        where:
          mode === 'required'
            ? undefined
            : {
                arg: g.arg({ type: PasswordFilter }),
                resolve(val) {
                  if (val === null) {
                    throw new GraphQLError('Input error: Password filters cannot be set to null', {
                      extensions: { code: 'KS_USER_INPUT_ERROR' },
                    })
                  }
                  if (val.isSet) return { not: null }
                  return null
                },
              },
        create: {
          arg: g.arg({ type: g.String }),
          resolve(val) {
            if (val === undefined) return null
            return inputResolver(val)
          },
        },
        update: {
          arg: g.arg({ type: g.String }),
          resolve: inputResolver,
        },
      },
      __ksTelemetryFieldTypeName: '@keystone-6/password',
      views: '@keystone-6/auth/fields/password/views',
      getAdminMeta: (): Parameters<typeof controller>[0]['fieldMeta'] => ({
        isNullable: mode === 'optional',
        validation: {
          match: match
            ? {
                regex: {
                  source: match.regex.source,
                  flags: match.regex.flags,
                },
                explanation: match.explanation ?? `value must match ${match.regex}`,
              }
            : null,
          length: {
            max: max ?? null,
            min: min ?? 8,
          },
        },
      }),
      output: g.fieldTypeOutput({
        type: PasswordState,
        select: {},
        resolve(val) {
          return { isSet: val.value !== null }
        },
        extensions: {
          keystoneKDF: kdf,
        },
      }),
    })
  }
}

export function getPasswordFieldKDF(
  schema: GraphQLSchema,
  listKey: string,
  fieldKey: string
): KDF | null {
  const gqlOutputType = schema.getType(listKey)
  if (!isObjectType(gqlOutputType)) return null
  const passwordField = gqlOutputType.getFields()[fieldKey]
  if (!passwordField?.extensions.keystoneKDF) return null
  return passwordField.extensions.keystoneKDF as KDF
}
