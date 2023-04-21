import {
  BaseListTypeInfo,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
} from '@keystone-6/core/types';
import { graphql } from '@keystone-6/core';

export type PairFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo>;

type PairInput = string;
type PairOutput = string;

const PairInput = graphql.String;
const PairOutput = graphql.String;

const PairFilter = graphql.inputObject({
  name: 'PairFilter',
  fields: {
    equals: graphql.arg({ type: graphql.String }),
  },
});

export function pair<ListTypeInfo extends BaseListTypeInfo>(
  config: PairFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  function resolveInput(value: PairInput | null | undefined) {
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

  function resolveWhere(value: null | { equals: string | null | undefined }) {
    if (value === null) {
      throw new Error('PairFilter cannot be null');
    }
    if (value.equals === undefined) {
      return {};
    }
    const { left, right } = resolveInput(value.equals);
    return {
      left: { equals: left },
      right: { equals: right },
    };
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
        },
        right: {
          kind: 'scalar',
          mode: 'optional',
          scalar: 'String',
        },
      },
    })({
      ...config,
      input: {
        where: {
          arg: graphql.arg({ type: PairFilter }),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          resolve(value, context) {
            return resolveWhere(value);
          },
        },
        create: {
          arg: graphql.arg({ type: PairInput }),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          resolve(value, context) {
            return resolveInput(value);
          },
        },
        update: {
          arg: graphql.arg({ type: PairInput }),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          resolve(value, context) {
            return resolveInput(value);
          },
        },
      },
      output: graphql.field({
        type: PairOutput,
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
