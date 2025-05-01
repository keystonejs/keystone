import {
  BaseFieldTypeInfo,
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
} from '@keystone-6/core/types'
import { g } from '@keystone-6/core'

type TextFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  BaseFieldTypeInfo
> & {
  isIndexed?: boolean | 'unique'
  dependency: {
    field: string
    minimumValue: number
  }
}

export function feedback<ListTypeInfo extends BaseListTypeInfo>({
  isIndexed,
  dependency,
  ...config
}: TextFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> {
  return meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'String',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
    })({
      ...config,
      input: {
        create: {
          arg: g.arg({ type: g.String }),
          resolve(value, context) {
            return value
          },
        },
        update: { arg: g.arg({ type: g.String }) },
        orderBy: { arg: g.arg({ type: orderDirectionEnum }) },
      },
      output: g.field({
        type: g.String,
        resolve({ value, item }, args, context, info) {
          return value
        },
      }),
      views: './4-conditional-field/views',
      getAdminMeta() {
        return {
          dependency,
        }
      },
    })
}
