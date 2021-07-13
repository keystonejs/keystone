import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  legacyFilters,
  orderDirectionEnum,
  schema,
  filters,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import { getIndexType } from '../../get-index-type';

export type AutoIncrementFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<number, TGeneratedListTypes>;
    isRequired?: boolean;
    isIndexed?: boolean;
    isUnique?: boolean;
    gqlType?: 'ID' | 'Int';
  };

export const autoIncrement =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    isIndexed,
    isUnique,
    gqlType,
    ...config
  }: AutoIncrementFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    const type = meta.fieldKey === 'id' || gqlType === 'ID' ? schema.ID : schema.Int;

    const inputResolver = (val: number | string | null | undefined) => {
      if (val == null) {
        return val;
      }
      return Number(val);
    };
    return fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Int',
      default: { kind: 'autoincrement' },
      index: getIndexType({ isIndexed, isUnique }),
    })({
      ...config,
      input: {
        where: {
          arg: schema.arg({ type: filters[meta.provider].Int.optional }),
        },
        uniqueWhere: isUnique ? { arg: schema.arg({ type }), resolve: x => Number(x) } : undefined,
        create: { arg: schema.arg({ type }), resolve: inputResolver },
        update: { arg: schema.arg({ type }), resolve: inputResolver },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({
        type,
        resolve({ value }) {
          if (value === null) return null;
          return type === schema.ID ? value.toString() : value;
        },
      }),
      views: resolveView('integer/views'),
      __legacy: {
        isRequired,
        defaultValue,
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, type),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, type),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, type),
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
