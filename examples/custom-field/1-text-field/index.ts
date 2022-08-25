import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  filters,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';

export type TextFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean | 'unique';
  };

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
        where: {
          arg: graphql.arg({ type: filters[meta.provider].String.optional }),
          resolve: filters.resolveCommon,
        },
        create: {
          arg: graphql.arg({ type: graphql.String }),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          resolve(value, context) {
            return value;
          },
        },
        update: { arg: graphql.arg({ type: graphql.String }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.String,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        resolve({ value, item }, args, context, info) {
          return value;
        },
      }),
      views: './1-text-field/views',
      getAdminMeta() {
        return {};
      },
    });
}
