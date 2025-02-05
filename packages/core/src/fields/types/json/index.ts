import {
  type BaseListTypeInfo,
  type JSONValue,
  type FieldTypeFunc,
  type CommonFieldConfig,
  jsonFieldTypePolyfilledForSQLite,
} from '../../../types'
import { g } from '../../..'

export type JsonFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    defaultValue?: JSONValue
    db?: { map?: string, extendPrismaSchema?: (field: string) => string }
  }

export const json =
  <ListTypeInfo extends BaseListTypeInfo>({
    defaultValue = null,
    ...config
  }: JsonFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type json")
    }

    return jsonFieldTypePolyfilledForSQLite(
      meta.provider,
      {
        ...config,
        __ksTelemetryFieldTypeName: '@keystone-6/json',
        input: {
          create: {
            arg: g.arg({ type: g.JSON }),
            resolve (val) {
              return val === undefined ? defaultValue : val
            },
          },
          update: { arg: g.arg({ type: g.JSON }) },
        },
        output: g.field({ type: g.JSON }),
        views: '@keystone-6/core/fields/types/json/views',
        getAdminMeta: () => ({ defaultValue }),
      },
      {
        default:
          defaultValue === null
            ? undefined
            : { kind: 'literal', value: JSON.stringify(defaultValue) },
        map: config.db?.map,
        extendPrismaSchema: config.db?.extendPrismaSchema,
      }
    )
  }
