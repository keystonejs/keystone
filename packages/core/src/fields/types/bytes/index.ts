import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
} from '../../../types'
import { g } from '../../..'
import { makeValidateHook } from '../../non-null-graphql'
import { weakMemoize } from '../../../lib/core/utils'
import { GraphQLError } from 'graphql'
import type { GArg, GInputObjectType, GList, GNonNull, GScalarType } from '@graphql-ts/schema'

export type BytesFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: true | 'unique'
    graphql?: {
      scalar?: GScalarType<Uint8Array, string>
    }
    validation?: {
      /**
       * Makes the field disallow null values. It does not constrain the length of the value.
       */
      isRequired?: boolean
      /**
       * Specifies the minimum and maximum length of the value in _bytes_. It does _not_ represent the length in the encoded form.
       */
      length?: { min?: number; max?: number }
    }
    defaultValue?: Uint8Array | null
    db?: {
      isNullable?: boolean
      map?: string
      extendPrismaSchema?: (field: string) => string
      /**
       * The underlying database type.
       * Only some of the types are supported on PostgreSQL and MySQL.
       * The native type is not customisable on SQLite.
       * See Prisma's documentation for more information about the supported types.
       *
       * https://www.prisma.io/docs/orm/reference/prisma-schema-reference#bytes
       */
      nativeType?: string
    }
  }

export type TextFieldMeta = {
  isNullable: boolean
  validation: {
    isRequired: boolean
  }
  defaultValue: string | null
}

export function bytes<ListTypeInfo extends BaseListTypeInfo>(
  config: BytesFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  const { defaultValue = null, isIndexed, validation = {} } = config

  const scalar = config.graphql?.scalar ?? g.Hex

  config.db ??= {}

  const isRequired = validation.isRequired ?? false
  const min = validation.isRequired ? (validation.length?.min ?? 1) : validation.length?.min
  const max = validation.length?.max

  return meta => {
    {
      const serializedExample = scalar.serialize(new Uint8Array([0]))
      if (typeof serializedExample !== 'string') {
        throw new Error(
          `The GraphQL scalar type specified for ${meta.listKey}.${meta.fieldKey} must serialize Uint8Arrays to strings`
        )
      }
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
    if (min !== undefined && max !== undefined && min > max) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies a validation.length.max that is less than the validation.length.min, and therefore has no valid options`
      )
    }

    const hasAdditionalValidation = min !== undefined || max !== undefined
    const { mode, validate } = makeValidateHook(
      meta,
      config,
      hasAdditionalValidation
        ? ({ resolvedData, operation, addValidationError }) => {
            if (operation === 'delete') return

            const value: Uint8Array | null | undefined = resolvedData[meta.fieldKey]
            if (value != null) {
              if (min !== undefined && value.length < min) {
                if (min === 1) {
                  addValidationError(`value must not be empty`)
                } else {
                  addValidationError(`value must be at least ${min} bytes long`)
                }
              }
              if (max !== undefined && value.length > max) {
                addValidationError(`value must be no longer than ${max} bytes`)
              }
            }
          }
        : undefined
    )

    let clientSideDefaultValue = null
    if (defaultValue !== null) {
      clientSideDefaultValue = scalar.serialize(defaultValue)
      if (typeof clientSideDefaultValue !== 'string') {
        throw new Error(
          `The GraphQL scalar type specified for ${meta.listKey}.${meta.fieldKey} must serialize Uint8Arrays to strings`
        )
      }
    } else if (mode === 'required') {
      clientSideDefaultValue = scalar.serialize(new Uint8Array(0))
      if (typeof clientSideDefaultValue !== 'string') {
        throw new Error(
          `The GraphQL scalar type specified for ${meta.listKey}.${meta.fieldKey} must serialize Uint8Arrays to strings`
        )
      }
    }

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'Bytes',
      default: defaultValue === null ? undefined : { kind: 'literal', value: defaultValue },
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      map: config.db?.map,
      nativeType: config.db?.nativeType,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      hooks: {
        ...config.hooks,
        validate,
      },
      input: {
        uniqueWhere: isIndexed === 'unique' ? { arg: g.arg({ type: scalar }) } : undefined,
        where: {
          arg: g.arg({
            type: mode === 'optional' ? getNullableFilterType(scalar) : getFilterType(scalar),
          }),
        },
        create: {
          arg: g.arg({
            type: scalar,
          }),
          resolve(val) {
            if (val !== undefined) return val
            return defaultValue ?? null
          },
        },
        update: { arg: g.arg({ type: scalar }) },
        orderBy: { arg: g.arg({ type: orderDirectionEnum }) },
      },
      output: g.field({ type: scalar }),
      __ksTelemetryFieldTypeName: '@keystone-6/bytes',
      views: () => import('@keystone-6/core/fields/types/bytes/views'),
      getAdminMeta(): TextFieldMeta {
        return {
          validation: {
            isRequired,
          },
          defaultValue: clientSideDefaultValue,
          isNullable: mode === 'optional',
        }
      },
    })
  }
}

type BytesFilterType = GInputObjectType<{
  equals?: GArg<GScalarType<Uint8Array, string>>
  in?: GArg<GList<GNonNull<GScalarType<Uint8Array, string>>>>
  notIn?: GArg<GList<GNonNull<GScalarType<Uint8Array, string>>>>
  not?: GArg<BytesFilterType>
}>

// the weakMemoizes are important so reusing the same scalar type for multiple `bytes` fields uses the same (===) filter type
// rather than a duplicate one which would cause an error about two types with the same name
const getFilterType = weakMemoize((scalar: GScalarType<Uint8Array, string>) => {
  const filter: BytesFilterType = g.inputObject({
    name: `${scalar.name}Filter`,
    fields: () => ({
      equals: g.arg({ type: scalar }),
      in: g.arg({ type: g.list(g.nonNull(scalar)) }),
      notIn: g.arg({ type: g.list(g.nonNull(scalar)) }),
      not: g.arg({ type: filter }),
    }),
  })
  return filter
})

const getNullableFilterType = weakMemoize((scalar: GScalarType<Uint8Array, string>) => {
  const filter: BytesFilterType = g.inputObject({
    name: `${scalar.name}NullableFilter`,
    fields: () => ({
      equals: g.arg({ type: scalar }),
      in: g.arg({ type: g.list(g.nonNull(scalar)) }),
      notIn: g.arg({ type: g.list(g.nonNull(scalar)) }),
      not: g.arg({ type: filter }),
    }),
  })
  return filter
})

export function bytesScalar(opts: {
  name: string
  serialize: (value: Uint8Array) => string
  parse: (value: string) => Uint8Array
  description?: string
  specifiedByURL?: string
}) {
  return g.scalar<Uint8Array, string>({
    name: opts.name,
    description: opts.description,
    specifiedByURL: opts.specifiedByURL,
    parseLiteral(value) {
      if (value.kind !== 'StringValue') {
        throw new GraphQLError(`${opts.name} only accepts values as strings`)
      }
      return opts.parse(value.value)
    },
    parseValue(value) {
      // so that when you're doing a mutation in a resolver, you can just pass in a Uint8Array directly
      if (value instanceof Uint8Array) {
        // duplicate it though to avoid any weirdness with the array being mutated
        // + ensuring that if you pass in a Buffer, resolvers recieve a normal Uint8Array
        return Uint8Array.from(value)
      }
      if (typeof value !== 'string') {
        throw new GraphQLError(`${opts.name} only accepts values as strings`)
      }
      return opts.parse(value)
    },
    serialize(value) {
      if (!(value instanceof Uint8Array)) {
        throw new GraphQLError(`unexpected value provided to ${opts.name} scalar: ${value}`)
      }
      return opts.serialize(value)
    },
  })
}
