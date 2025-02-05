import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
} from '../../../types'
import { type CalendarDayFieldMeta } from './views'
import { g } from '../../..'
import { filters } from '../../filters'
import { makeValidateHook } from '../../non-null-graphql'
import { mergeFieldHooks } from '../../resolve-hooks'

export type CalendarDayFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean | 'unique'
    validation?: {
      isRequired?: boolean
    }
    defaultValue?: string
    db?: {
      isNullable?: boolean
      extendPrismaSchema?: (field: string) => string
      map?: string
    }
  }

export function calendarDay <ListTypeInfo extends BaseListTypeInfo> (config: CalendarDayFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  const {
    isIndexed,
    validation,
    defaultValue,
  } = config
  return (meta) => {
    if (typeof defaultValue === 'string') {
      try {
        g.CalendarDay.graphQLType.parseValue(defaultValue)
      } catch (err) {
        throw new Error(
          `The calendarDay field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: ${defaultValue} but values must be provided as a full-date ISO8601 string such as 1970-01-01`
        )
      }
    }

    const usesNativeDateType = meta.provider === 'postgresql' || meta.provider === 'mysql'

    function resolveInput (value: string | null | undefined) {
      if (meta.provider === 'sqlite' || value == null) {
        return value
      }
      return dateStringToDateObjectInUTC(value)
    }

    const {
      mode,
      validate,
    } = makeValidateHook(meta, config)
    const commonResolveFilter = mode === 'optional' ? filters.resolveCommon : <T>(x: T) => x

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: usesNativeDateType ? 'DateTime' : 'String',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'string'
          ? {
              kind: 'literal',
              value: defaultValue,
            }
          : undefined,
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
      nativeType: usesNativeDateType ? 'Date' : undefined,
    })({
      ...config,
      hooks: mergeFieldHooks({ validate }, config.hooks),
      input: {
        uniqueWhere:
          isIndexed === 'unique'
            ? {
                arg: g.arg({ type: g.CalendarDay }),
                resolve: usesNativeDateType ? dateStringToDateObjectInUTC : undefined,
              }
            : undefined,
        where: {
          arg: g.arg({
            type: mode === 'optional' ? CalendarDayNullableFilter : CalendarDayFilter,
          }),
          resolve: usesNativeDateType
            ? value => commonResolveFilter(transformFilterDateStringsToDateObjects(value))
            : commonResolveFilter,
        },
        create: {
          arg: g.arg({
            type: g.CalendarDay,
            defaultValue,
          }),
          resolve (val: string | null | undefined) {
            if (val === undefined) {
              val = defaultValue ?? null
            }
            return resolveInput(val)
          },
        },
        update: { arg: g.arg({ type: g.CalendarDay }), resolve: resolveInput },
        orderBy: { arg: g.arg({ type: orderDirectionEnum }) },
      },
      output: g.field({
        type: g.CalendarDay,
        resolve ({ value }) {
          if (value instanceof Date) {
            return value.toISOString().slice(0, 10)
          }
          return value
        },
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/calendarDay',
      views: '@keystone-6/core/fields/types/calendarDay/views',
      getAdminMeta (): CalendarDayFieldMeta {
        return {
          defaultValue: defaultValue ?? null,
          isRequired: validation?.isRequired ?? false,
        }
      },
    })
  }
}

function dateStringToDateObjectInUTC (value: string) {
  return new Date(`${value}T00:00Z`)
}

type CalendarDayFilterType = g.InputObjectType<{
  equals: g.Arg<typeof g.CalendarDay>
  in: g.Arg<g.ListType<g.NonNullType<typeof g.CalendarDay>>>
  notIn: g.Arg<g.ListType<g.NonNullType<typeof g.CalendarDay>>>
  lt: g.Arg<typeof g.CalendarDay>
  lte: g.Arg<typeof g.CalendarDay>
  gt: g.Arg<typeof g.CalendarDay>
  gte: g.Arg<typeof g.CalendarDay>
  not: g.Arg<CalendarDayFilterType>
}>

function transformFilterDateStringsToDateObjects (
  filter: g.InferValueFromInputType<CalendarDayFilterType>
): Parameters<typeof filters.resolveCommon>[0] {
  if (filter === null) {
    return filter
  }
  return Object.fromEntries(
    Object.entries(filter).map(([key, value]) => {
      if (value == null) {
        return [key, value]
      }
      if (Array.isArray(value)) {
        return [key, value.map(dateStringToDateObjectInUTC)]
      }
      if (typeof value === 'object') {
        return [key, transformFilterDateStringsToDateObjects(value)]
      }
      return [key, dateStringToDateObjectInUTC(value)]
    })
  )
}

const filterFields = (nestedType: CalendarDayFilterType) => ({
  equals: g.arg({ type: g.CalendarDay }),
  in: g.arg({ type: g.list(g.nonNull(g.CalendarDay)) }),
  notIn: g.arg({ type: g.list(g.nonNull(g.CalendarDay)) }),
  lt: g.arg({ type: g.CalendarDay }),
  lte: g.arg({ type: g.CalendarDay }),
  gt: g.arg({ type: g.CalendarDay }),
  gte: g.arg({ type: g.CalendarDay }),
  not: g.arg({ type: nestedType }),
})

const CalendarDayNullableFilter: CalendarDayFilterType = g.inputObject({
  name: 'CalendarDayNullableFilter',
  fields: () => filterFields(CalendarDayNullableFilter),
})

const CalendarDayFilter: CalendarDayFilterType = g.inputObject({
  name: 'CalendarDayFilter',
  fields: () => filterFields(CalendarDayFilter),
})
