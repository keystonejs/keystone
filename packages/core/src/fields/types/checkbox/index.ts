import { userInputError } from '../../../lib/core/graphql-errors.ts'
import type { SimpleFieldTypeInfo } from '../../../types/index.ts'
import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
} from '../../../types/index.ts'
import { g } from '../../../index.ts'
import { assertReadIsNonNullAllowed } from '../../non-null-graphql.ts'
import { filters } from '../../filters/index.ts'
import type { controller } from './views/index.tsx'

export type CheckboxFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  SimpleFieldTypeInfo<'Boolean'>
> & {
  defaultValue?: boolean
  db?: {
    map?: string
    extendPrismaSchema?: (field: string) => string
  }
}

export function checkbox<ListTypeInfo extends BaseListTypeInfo>(
  config: CheckboxFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  const { defaultValue = false } = config

  return meta => {
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
        where: { arg: g.arg({ type: filters[meta.provider].Boolean.required }) },
        create: {
          arg: g.arg({
            type: g.Boolean,
            defaultValue: typeof defaultValue === 'boolean' ? defaultValue : undefined,
          }),
          resolve(val) {
            if (val === null) throw userInputError('Checkbox fields cannot be set to null')
            return val ?? defaultValue
          },
        },
        update: {
          arg: g.arg({ type: g.Boolean }),
          resolve(val) {
            if (val === null) throw userInputError('Checkbox fields cannot be set to null')
            return val
          },
        },
        orderBy: { arg: g.arg({ type: orderDirectionEnum }) },
      },
      output: g.field({ type: g.Boolean }),
      __ksTelemetryFieldTypeName: '@keystone-6/checkbox',
      views: '@keystone-6/core/fields/types/checkbox/views',
      getAdminMeta: (): Parameters<typeof controller>[0]['fieldMeta'] => ({
        defaultValue,
      }),
    })
  }
}
