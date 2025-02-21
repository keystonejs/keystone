import type { ScalarDBField } from '../types'
import {
  type BaseListTypeInfo,
  type DatabaseProvider,
  type FieldTypeFunc,
  type IdFieldConfig,
  fieldType,
  orderDirectionEnum,
} from '../types'
import { g } from '../types/schema'
import { userInputError } from './core/graphql-errors'

type IDType = string | number | null

function isInt(x: IDType) {
  if (x === null) return
  if (x === '') return
  const nom = typeof x === 'string' ? Number(x) : x
  if (Number.isInteger(nom)) return nom
}

function isBigInt(x: IDType) {
  if (x === null) return
  if (x === '') return
  try {
    return BigInt(x)
  } catch {}
}

function isString(x: IDType) {
  if (typeof x !== 'string') return
  if (x === '') return
  return x
}

// TODO: this should be on the user, remove in breaking change?
function isUuid(x: IDType) {
  if (typeof x !== 'string') return
  if (x === '') return
  return x.toLowerCase()
}

const nonCircularFields = {
  equals: g.arg({ type: g.ID }),
  in: g.arg({ type: g.list(g.nonNull(g.ID)) }),
  notIn: g.arg({ type: g.list(g.nonNull(g.ID)) }),
  lt: g.arg({ type: g.ID }),
  lte: g.arg({ type: g.ID }),
  gt: g.arg({ type: g.ID }),
  gte: g.arg({ type: g.ID }),
}

type IDFilterType = g.InputObjectType<
  typeof nonCircularFields & {
    not: g.Arg<typeof IDFilter>
  }
>

const IDFilter: IDFilterType = g.inputObject({
  name: 'IDFilter',
  fields: () => ({
    ...nonCircularFields,
    not: g.arg({ type: IDFilter }),
  }),
})

const filterArg = g.arg({ type: IDFilter })

function resolveInput(
  input: Exclude<g.InferValueFromArg<typeof filterArg>, undefined>,
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
    [ku in IdFieldConfig['kind']]?: string
  }
} = {
  postgresql: {
    uuid: 'Uuid' as const,
  },
}

function unpack(
  i: IdFieldConfig
): Pick<ScalarDBField<'String' | 'Int' | 'BigInt', 'required'>, 'scalar' | 'default'> {
  if (i.kind === 'random') {
    const { kind, bytes, encoding } = i
    if (typeof bytes === 'number') {
      if (bytes !== bytes >>> 0) {
        throw new TypeError(`Expected positive integer for random bytes, not ${bytes}`)
      }
    }

    return {
      scalar: 'String',
      // our defaults are 32 bytes, as base64url
      //   256 / Math.log2(64) ~ 43 characters
      //
      // for case-insensitive databases that is
      //   225 bits ~ Math.log2((26 + 10 + 2) ** 43)
      default: {
        kind,
        bytes: bytes ?? 32,
        encoding: encoding ?? 'base64url',
      },
    }
  }
  const { kind, type } = i
  if (kind === 'cuid') return { scalar: 'String', default: { kind, version: i.version } }
  if (kind === 'uuid') return { scalar: 'String', default: { kind, version: i.version } }
  if (kind === 'nanoid') return { scalar: 'String', default: { kind, length: i.length } }
  if (kind === 'ulid') return { scalar: 'String', default: { kind } }
  if (kind === 'string') return { scalar: 'String', default: undefined }
  if (kind === 'number') return { scalar: type ?? 'Int', default: undefined }
  if (kind === 'autoincrement') return { scalar: type ?? 'Int', default: { kind } }
  throw new Error(`Unknown id type ${kind}`)
}

export function idFieldType(config: IdFieldConfig): FieldTypeFunc<BaseListTypeInfo> {
  const kind = config.kind
  const dbFieldOptions = unpack(config)
  const parseTypeFn = {
    Int: isInt,
    BigInt: isBigInt,
    String: isString,
    UUID: isUuid, // TODO: remove in breaking change
  }[kind === 'uuid' ? 'UUID' : dbFieldOptions.scalar]

  function parse(value: IDType) {
    const result = parseTypeFn(value)
    if (result === undefined) {
      throw userInputError(
        `Only a ${dbFieldOptions.scalar.toLowerCase()} can be passed to id filters`
      )
    }
    return result
  }

  return meta => {
    if (
      meta.provider === 'sqlite' &&
      kind === 'autoincrement' &&
      dbFieldOptions.scalar === 'BigInt'
    ) {
      throw new Error(
        `{ kind: ${kind}, type: ${dbFieldOptions.scalar} } is not supported by SQLite`
      )
    }

    return fieldType({
      ...dbFieldOptions,
      kind: 'scalar',
      mode: 'required',
      nativeType: NATIVE_TYPES[meta.provider]?.[kind],
    })({
      ...config,

      // the ID field is always filterable and orderable
      isFilterable: true, // TODO: should it be?
      isOrderable: true, // TODO: should it be?

      input: {
        where: {
          arg: filterArg,
          resolve(val) {
            return resolveInput(val, parse)
          },
        },
        uniqueWhere: { arg: g.arg({ type: g.ID }), resolve: parse },
        orderBy: { arg: g.arg({ type: orderDirectionEnum }) },
      },
      output: g.field({
        type: g.nonNull(g.ID),
        resolve({ value }) {
          return value.toString()
        },
      }),
      views: '@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/id-field-view',
      getAdminMeta: () => ({ kind, type: dbFieldOptions.scalar }),
      ui: {
        createView: {
          fieldMode: 'hidden',
        },
        itemView: {
          fieldPosition: 'sidebar',
        },
      },
    })
  }
}
