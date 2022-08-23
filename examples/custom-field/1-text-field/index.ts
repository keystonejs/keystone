import {
  BaseModelTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  filters,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';

export type TextFieldConfig<ModelTypeInfo extends BaseModelTypeInfo> =
  CommonFieldConfig<ModelTypeInfo> & {
    isIndexed?: boolean | 'unique';
  };

export function text<ModelTypeInfo extends BaseModelTypeInfo>({
  isIndexed,
  ...config
}: TextFieldConfig<ModelTypeInfo> = {}): FieldTypeFunc<ModelTypeInfo> {
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
      views: require.resolve('./views.tsx'),
      getAdminMeta() {
        return {};
      },
    });
}
