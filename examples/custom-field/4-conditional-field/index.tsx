import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';

type TextFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<ListTypeInfo> & {
  isIndexed?: boolean | 'unique';
  dependency: {
    field: string;
    minimumValue: number;
  };
};

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
      views: './4-conditional-field/views',
      getAdminMeta() {
        return {
          dependency,
        };
      },
    });
}
