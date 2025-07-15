import { g } from '../../..'
import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  fieldType,
  type FieldTypeFunc,
  type JSONValue,
} from '../../../types'

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

export type JsonFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  FieldTypeInfo
> & {
  defaultValue?: JSONValue
  db?: { map?: string; extendPrismaSchema?: (field: string) => string }
}

export function json<ListTypeInfo extends BaseListTypeInfo>({
  defaultValue = null,
  ...config
}: JsonFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    if ((config as any).isIndexed === 'unique') {
      throw Error("isIndexed: 'unique' is not a supported option for field type json")
    }

    return fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Json',
      default:
        defaultValue === null
          ? undefined
          : meta.provider === 'sqlite'
            ? undefined
            : {
                kind: 'literal',
                // TODO: waiting on https://github.com/prisma/prisma/issues/26571
                //   input.create manages defaultValues anyway
                value: JSON.stringify(defaultValue ?? null),
              },
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      __ksTelemetryFieldTypeName: '@keystone-6/json',
      input: {
        create: {
          arg: g.arg({ type: g.JSON }),
          resolve(val) {
            // TODO: redundant when https://github.com/prisma/prisma/issues/26571 is resolved
            return val === undefined ? defaultValue : val
          },
        },
        update: { arg: g.arg({ type: g.JSON }) },
      },
      output: g.field({ type: g.JSON }),
      views: '@keystone-6/core/fields/types/json/views',
      getAdminMeta: () => ({ defaultValue }),
    })
  }
}
