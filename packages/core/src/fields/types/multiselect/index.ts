import { classify } from 'inflection'

import { g } from '../../..'
import { humanize } from '../../../lib/utils'
import type { JSONValue } from '../../../types'
import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldData,
  fieldType,
  type FieldTypeFunc,
} from '../../../types'
import { makeValidateHook } from '../../non-null-graphql'
import type { controller } from './views'

type FieldTypeInfo = {
  item: JSONValue | null
  inputs: {
    where: never
    create: JSONValue | undefined
    update: JSONValue | undefined
    uniqueWhere: never
    orderBy: never
  }
  prisma: {
    create: JSONValue | undefined
    update: JSONValue | undefined
  }
}

export type MultiselectFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  FieldTypeInfo
> &
  (
    | {
        /**
         * When a value is provided as just a string, it will be formatted in the same way
         * as field labels are to create the label.
         */
        options: readonly ({ label: string; value: string } | string)[]
        /**
         * If `enum` is provided on SQLite, it will use an enum in GraphQL but a string in the database.
         */
        type?: 'string' | 'enum'
        defaultValue?: readonly string[] | null
      }
    | {
        options: readonly { label: string; value: number }[]
        type: 'integer'
        defaultValue?: readonly number[] | null
      }
  ) & {
    ui?: {
      displayMode?: 'checkboxes' | 'select'
    }
    db?: {
      isNullable?: boolean
      map?: string
      extendPrismaSchema?: (field: string) => string
    }
  }

// these are the lowest and highest values for a signed 32-bit integer
const MAX_INT = 2147483647
const MIN_INT = -2147483648

export function multiselect<ListTypeInfo extends BaseListTypeInfo>(
  config: MultiselectFieldConfig<ListTypeInfo>
): FieldTypeFunc<ListTypeInfo> {
  const { defaultValue: defaultValue_, ui: { displayMode = 'select', ...ui } = {} } = config

  config.db ??= {}
  config.db.isNullable ??= false // TODO: deprecated, remove in breaking change
  const defaultValue = config.db.isNullable ? defaultValue_ : (defaultValue_ ?? []) // TODO: deprecated, remove in breaking change?

  return meta => {
    if ((config as any).isIndexed === 'unique') {
      throw TypeError("isIndexed: 'unique' is not a supported option for field type multiselect")
    }

    const resolveCreate = <T extends string | number>(val: T[] | null | undefined): T[] | null => {
      const resolved = resolveUpdate(val)
      if (resolved === undefined) {
        return defaultValue as T[]
      }
      return resolved
    }

    const resolveUpdate = <T extends string | number>(
      val: T[] | null | undefined
    ): T[] | null | undefined => {
      return val
    }

    const transformedConfig = configToOptionsAndGraphQLType(config, meta)

    const type = g.list(g.nonNull(transformedConfig.graphqlType))

    const accepted = new Set(transformedConfig.options.map(x => x.value))
    if (accepted.size !== transformedConfig.options.length) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} has duplicate options, this is not allowed`)
    }

    const { mode, validate } = makeValidateHook(
      meta,
      config,
      ({ inputData, operation, addValidationError }) => {
        if (operation === 'delete') return

        const values: readonly (string | number)[] | null | undefined = inputData[meta.fieldKey] // resolvedData is JSON
        if (values != null) {
          for (const value of values) {
            if (!accepted.has(value)) {
              addValidationError(`'${value}' is not an accepted option`)
            }
          }
          if (new Set(values).size !== values.length) {
            addValidationError(`non-unique set of options selected`)
          }
        }
      }
    )

    return fieldType({
      kind: 'scalar',
      scalar: 'Json',
      mode,
      map: config?.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
      default:
        meta.provider === 'sqlite'
          ? undefined
          : {
              kind: 'literal',
              // TODO: waiting on https://github.com/prisma/prisma/issues/26571
              //   input.create manages defaultValues anyway
              value: JSON.stringify(defaultValue ?? null),
            },
    })({
      ...config,
      ui,
      __ksTelemetryFieldTypeName: '@keystone-6/multiselect',
      hooks: {
        ...config.hooks,
        validate,
      },
      views: '@keystone-6/core/fields/types/multiselect/views',
      getAdminMeta: (): Parameters<typeof controller>[0]['fieldMeta'] => ({
        options: transformedConfig.options,
        type: config.type ?? 'string',
        displayMode: displayMode,
        defaultValue: [],
      }),
      input: {
        create: { arg: g.arg({ type }), resolve: resolveCreate },
        update: { arg: g.arg({ type }), resolve: resolveUpdate },
      },
      output: g.field({
        type: type,
        resolve({ value }) {
          return value as any
        },
      }),
    })
  }
}

function configToOptionsAndGraphQLType(
  config: MultiselectFieldConfig<BaseListTypeInfo>,
  meta: FieldData
) {
  if (config.type === 'integer') {
    if (
      config.options.some(
        ({ value }) => !Number.isInteger(value) || value > MAX_INT || value < MIN_INT
      )
    ) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies integer values that are outside the range of a 32-bit signed integer`
      )
    }
    return {
      graphqlType: g.Int,
      options: config.options,
    }
  }

  const options = config.options.map(option => {
    if (typeof option === 'string') {
      return {
        label: humanize(option),
        value: option,
      }
    }
    return option
  })

  if (config.type === 'enum') {
    const enumName = `${meta.listKey}${classify(meta.fieldKey)}Type`
    const graphqlType = g.enum({
      name: enumName,
      values: g.enumValues(options.map(x => x.value)),
    })
    return {
      graphqlType,
      options,
    }
  }
  return {
    graphqlType: g.String,
    options,
  }
}
