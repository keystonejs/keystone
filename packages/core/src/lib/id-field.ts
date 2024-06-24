import {
  type BaseListTypeInfo,
  type DatabaseProvider,
  type FieldTypeFunc,
  type IdFieldConfig,
  fieldType,
  orderDirectionEnum,
} from '../types'
import { graphql } from '..'
import { userInputError } from './core/graphql-errors'

type IDType = string | number | null

function isInt (x: IDType) {
  if (x === null) return
  if (x === '') return
  const nom = typeof x === 'string' ? Number(x) : x
  if (Number.isInteger(nom)) return nom
}

function isBigInt (x: IDType) {
  if (x === null) return
  if (x === '') return
  try {
    return BigInt(x)
  } catch {}
}

function isString (x: IDType) {
  if (typeof x !== 'string') return
  if (x === '') return
  return x
}

// TODO: this should be on the user, remove in breaking change?
function isUuid (x: IDType) {
  if (typeof x !== 'string') return
  if (x === '') return
  return x.toLowerCase()
}

const nonCircularFields = {
  equals: graphql.arg({ type: graphql.ID }),
  in: graphql.arg({ type: graphql.list(graphql.nonNull(graphql.ID)) }),
  notIn: graphql.arg({ type: graphql.list(graphql.nonNull(graphql.ID)) }),
  lt: graphql.arg({ type: graphql.ID }),
  lte: graphql.arg({ type: graphql.ID }),
  gt: graphql.arg({ type: graphql.ID }),
  gte: graphql.arg({ type: graphql.ID }),
}

type IDFilterType = graphql.InputObjectType<
  typeof nonCircularFields & {
    not: graphql.Arg<typeof IDFilter>
  }
>

const IDFilter: IDFilterType = graphql.inputObject({
  name: 'IDFilter',
  fields: () => ({
    ...nonCircularFields,
    not: graphql.arg({ type: IDFilter }),
  }),
})

const filterArg = graphql.arg({ type: IDFilter })

function resolveInput (
  input: Exclude<graphql.InferValueFromArg<typeof filterArg>, undefined>,
  parseId: (x: IDType) => unknown
) {
  const where: any = {}
  if (input === null) return where

  for (const key of ['equals', 'gt', 'gte', 'lt', 'lte'] as const) {
    const value = input[key]
    if (value === undefined) continue
    where[key] = parseId(value)
  }

  for (const key of ['in', 'notIn'] as const) {
    const value = input[key]
    if (!Array.isArray(value)) continue

    where[key] = value.map(x => parseId(x))
  }

  if (input.not !== undefined) {
    where.not = resolveInput(input.not, parseId)
  }

  return where
}

const NATIVE_TYPES: {
  [k in DatabaseProvider]?: {
    [ku in IdFieldConfig['kind']]?: string;
  };
} = {
  postgresql: {
    uuid: 'Uuid' as const,
  },
}

function unpack (i: IdFieldConfig) {
  if (i.kind === 'random') {
    const { kind, bytes, encoding } = i
    if (typeof bytes === 'number') {
      if (bytes !== bytes >>> 0) {
        throw new TypeError(`Expected positive integer for random bytes, not ${bytes}`)
      }
    }

    return {
      kind,
      type: 'String',
      // our defaults are 32 bytes, as base64url
      //   256 / Math.log2(64) ~ 43 characters
      //
      // for case-insensitive databases that is
      //   225 bits ~ Math.log2((26 + 10 + 2) ** 43)
      default_: {
        kind,
        bytes: bytes ?? 32,
        encoding: encoding ?? 'base64url',
      },
    } as const
  }
  const { kind, type } = i
  if (kind === 'cuid') return { kind: 'cuid', type: 'String', default_: { kind } } as const
  if (kind === 'uuid') return { kind: 'uuid', type: 'String', default_: { kind } } as const
  if (kind === 'string') return { kind: 'string', type: 'String', default_: undefined } as const
  if (kind === 'number') return { kind: 'number', type: type ?? 'Int', default_: undefined } as const
  if (kind === 'autoincrement') return { kind: 'autoincrement', type: type ?? 'Int', default_: { kind } } as const
  throw new Error(`Unknown id type ${kind}`)
}

export function idFieldType (config: IdFieldConfig): FieldTypeFunc<BaseListTypeInfo> {
  const { kind, type: type_, default_ } = unpack(config)
  const parseTypeFn = {
    Int: isInt,
    BigInt: isBigInt,
    String: isString,
    UUID: isUuid, // TODO: remove in breaking change
  }[kind === 'uuid' ? 'UUID' : type_]

  function parse (value: IDType) {
    const result = parseTypeFn(value)
    if (result === undefined) {
      throw userInputError(`Only a ${type_.toLowerCase()} can be passed to id filters`)
    }
    return result
  }

  return meta => {
    if (meta.provider === 'sqlite' && kind === 'autoincrement' && type_ === 'BigInt') {
      throw new Error(`{ kind: ${kind}, type: ${type_} } is not supported by SQLite`)
    }

    return fieldType({
      kind: 'scalar',
      mode: 'required',
      scalar: type_,
      nativeType: NATIVE_TYPES[meta.provider]?.[kind],
      default: default_,
    })({
      ...config,

      // the ID field is always filterable and orderable
      isFilterable: true, // TODO: should it be?
      isOrderable: true, // TODO: should it be?

      input: {
        where: {
          arg: filterArg,
          resolve (val) {
            return resolveInput(val, parse)
          },
        },
        uniqueWhere: { arg: graphql.arg({ type: graphql.ID }), resolve: parse },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.nonNull(graphql.ID),
        resolve ({ value }) {
          return value.toString()
        },
      }),
      views: '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/id-field-view',
      getAdminMeta: () => ({ kind, type: type_ }),
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldMode: 'hidden',
        },
      },
    })
  }
}
