import { g } from '@keystone-6/core'
import {
  BaseFieldTypeInfo,
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
} from '@keystone-6/core/types'
import { controller } from './views'

type TextFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  BaseFieldTypeInfo // TODO
> & {
  isIndexed?: boolean | 'unique'
}

export function text<ListTypeInfo extends BaseListTypeInfo>({
  isIndexed,
  ...config
}: TextFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
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
      views: './1-text-field/views',
      getAdminMeta() {
        return {} satisfies Parameters<typeof controller>[0]['fieldMeta']
      },
    })
}
