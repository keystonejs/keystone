import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
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
    if (!value) return { left: value, right: value };
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        create: {
          arg: graphql.arg({ type: graphql.String }),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          resolve(value, context) {
            return resolveInput(value);
          },
        },
        update: {
          arg: graphql.arg({
            type: graphql.String,
          }),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          resolve(value, context) {
            return resolveInput(value);
          },
        },
      },
      output: graphql.field({
        type: graphql.String,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        resolve({ value, item }, args, context, info) {
          return resolveOutput(value);
        },
      }),
      views: './3-pair-field/views',
      getAdminMeta() {
        return {};
      },
    });
}
