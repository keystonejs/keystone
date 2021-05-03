import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  sortDirectionEnum,
  types,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type AutoIncrementFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes>;

export const autoIncrement = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: AutoIncrementFieldConfig<TGeneratedListTypes> = {}
): FieldTypeFunc => () =>
  fieldType({
    kind: 'scalar',
    mode: 'optional',
    scalar: 'Int',
  })({
    ...config,
    input: {
      // TODO: fix the fact that TS did not catch that a resolver is needed here
      uniqueWhere: {
        arg: types.arg({ type: types.ID }),
        resolve(value) {
          return Number(value);
        },
      },
      sortBy: { arg: types.arg({ type: sortDirectionEnum }) },
    },
    output: types.field({
      type: types.ID,
      // TODO: should @ts-gql/schema understand the coercion that graphql-js can do here?
      resolve({ value }) {
        return value.toString();
      },
    }),
    views: resolveView('integer/views'),
  });
