import { userInputError } from '../../../lib/core/graphql-errors'
import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
} from '../../../types'
import { graphql } from '../../..'
import { assertReadIsNonNullAllowed } from '../../non-null-graphql'
import { filters } from '../../filters'

export type CheckboxFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    defaultValue?: boolean
    db?: {
      map?: string
      extendPrismaSchema?: (field: string) => string
    }
  }

export function checkbox <ListTypeInfo extends BaseListTypeInfo> (
  config: CheckboxFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  const {
    defaultValue = false,
  } = config

  return (meta) => {
    if ((config as any).isIndexed === 'unique') {
      throw TypeError("isIndexed: 'unique' is not a supported option for field type checkbox")
    }

    assertReadIsNonNullAllowed(meta, config, false)

    return fieldType({
      kind: 'scalar',
      mode: 'required',
      scalar: 'Boolean',
      default: { kind: 'literal', value: defaultValue },
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      input: {
        where: { arg: graphql.arg({ type: filters[meta.provider].Boolean.required }) },
        create: {
          arg: graphql.arg({
            type: graphql.Boolean,
            defaultValue: typeof defaultValue === 'boolean' ? defaultValue : undefined,
          }),
          resolve (val) {
            if (val === null) throw userInputError('Checkbox fields cannot be set to null')
            return val ?? defaultValue
          },
        },
        update: {
          arg: graphql.arg({ type: graphql.Boolean }),
          resolve (val) {
            if (val === null) throw userInputError('Checkbox fields cannot be set to null')
            return val
          },
        },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({ type: graphql.Boolean, }),
      __ksTelemetryFieldTypeName: '@keystone-6/checkbox',
      views: '@keystone-6/core/fields/types/checkbox/views',
      getAdminMeta: () => ({ defaultValue }),
    })
  }
}
