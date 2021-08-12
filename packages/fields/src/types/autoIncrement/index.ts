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
  };

export const autoIncrement =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    defaultValue,
    isIndexed,
    isUnique,
    ...config
  }: AutoIncrementFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
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
          arg: schema.arg({
            type: filters[meta.provider].Int.optional,
          }),
          resolve: filters.resolveCommon,
        },
        uniqueWhere: isUnique ? { arg: schema.arg({ type: schema.Int }) } : undefined,
        create: { arg: schema.arg({ type: schema.Int }) },
        update: { arg: schema.arg({ type: schema.Int }) },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({ type: schema.Int }),
      views: resolveView('integer/views'),
      __legacy: {
        isRequired,
        defaultValue,
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, schema.Int),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, schema.Int),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, schema.Int),
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
