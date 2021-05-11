import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  orderDirectionEnum,
  types,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type AutoIncrementFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes>;

export const autoIncrement =
  <TGeneratedListTypes extends BaseGeneratedListTypes>(
    config: AutoIncrementFieldConfig<TGeneratedListTypes> = {}
  ): FieldTypeFunc =>
  meta => {
    if (meta.fieldKey !== 'id') {
      throw new Error(
        `The autoIncrement field type is only supported as an idField but is used at ${meta.fieldKey}.${meta.fieldKey}`
      );
    }
    return fieldType({
      kind: 'scalar',
      mode: 'required',
      scalar: 'Int',
      default: { kind: 'autoincrement' },
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
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
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
  };
