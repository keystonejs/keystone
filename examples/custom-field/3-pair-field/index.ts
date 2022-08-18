import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  filters,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';

export type PairFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean | 'unique';
  };

export function pair<ListTypeInfo extends BaseListTypeInfo>({
  isIndexed,
  ...config
}: PairFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  function resolveInput(value: string | null | undefined) {
    if (!value) return { left: null, right: null };
    const [left = '', right = ''] = value.split(' ', 2);
    return {
      left,
      right,
    };
  }

  function resolveOutput(value: { left: string | null; right: string | null }) {
    const { left, right } = value;
    if (left === null || right === null) return null;
    return `${left} ${right}`;
  }

  return meta =>
    fieldType({
      kind: 'multi',
      fields: {
        left: {
          kind: 'scalar',
          mode: 'optional',
          scalar: 'String',
          index: isIndexed === true ? 'index' : isIndexed || undefined,
        },
        right: {
          kind: 'scalar',
          mode: 'optional',
          scalar: 'String',
          index: isIndexed === true ? 'index' : isIndexed || undefined,
        },
      },
    })({
      ...config,
      input: {
        where: {
          arg: graphql.arg({ type: filters[meta.provider].String.optional }),
          resolve: filters.resolveCommon,
        },
        create: {
          arg: graphql.arg({ type: graphql.String }),
          resolve(value, context) {
            return resolveInput(value);
          },
        },
        update: {
          arg: graphql.arg({
            type: graphql.String,
          }),
          resolve(value, context) {
            return resolveInput(value);
          },
        },

        orderBy: {
          arg: graphql.arg({
            type: orderDirectionEnum,
          }),
          resolve(orderDirection, context) {
            return {
              left: orderDirection,
              right: orderDirection,
            };
          },
        },
      },
      output: graphql.field({
        type: graphql.String,
        resolve({ value, item }, args, context, info) {
          return resolveOutput(value);
        },
      }),
      views: require.resolve('./views'),
      getAdminMeta() {
        return {};
      },
    });
}
