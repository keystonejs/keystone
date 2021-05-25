import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  filters,
  legacyFilters,
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
        where: { arg: types.arg({ type: filters[meta.provider].Int.required }) },
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
        type: types.nonNull(types.ID),
        // TODO: should @ts-gql/schema understand the coercion that graphql-js can do here?
        resolve({ value }) {
          return value.toString();
        },
      }),
      views: resolveView('integer/views'),
      __legacy: {
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, types.ID),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, types.ID),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, types.ID),
          },
          impls: {
            ...equalityConditions(meta.fieldKey, x => Number(x) || -1),
            ...legacyFilters.impls.orderingConditions(meta.fieldKey, x => Number(x) || -1),
            ...inConditions(meta.fieldKey, x => x.map((xx: any) => Number(xx) || -1)),
          },
        },
      },
    });
  };

function equalityConditions<T>(fieldKey: string, f: (a: any) => any) {
  return {
    [fieldKey]: (value: T) => ({ [fieldKey]: f(value) }),
    [`${fieldKey}_not`]: (value: T) => ({ NOT: { [fieldKey]: f(value) } }),
  };
}

function inConditions<T>(fieldKey: string, f: (a: any) => any) {
  return {
    [`${fieldKey}_in`]: (value: (T | null)[]) =>
      value.includes(null)
        ? { [fieldKey]: { in: f(value.filter(x => x !== null)) } }
        : { [fieldKey]: { in: f(value) } },
    [`${fieldKey}_not_in`]: (value: (T | null)[]) =>
      value.includes(null)
        ? { AND: [{ NOT: { [fieldKey]: { in: f(value.filter(x => x !== null)) } } }] }
        : { NOT: { [fieldKey]: { in: f(value) } } },
  };
}
