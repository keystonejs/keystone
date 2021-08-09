import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  FieldTypeFunc,
  CommonFieldConfig,
  legacyFilters,
  orderDirectionEnum,
  schema,
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
    const __legacy = {
      isRequired,
      defaultValue,
      filters: {
        fields: {
          ...legacyFilters.fields.equalityInputFields(meta.fieldKey, schema.Int),
          ...legacyFilters.fields.orderingInputFields(meta.fieldKey, schema.Int),
          ...legacyFilters.fields.inInputFields(meta.fieldKey, schema.Int),
        },
        impls: {
          ...legacyFilters.impls.equalityConditions(meta.fieldKey),
          ...legacyFilters.impls.orderingConditions(meta.fieldKey),
          ...legacyFilters.impls.inConditions(meta.fieldKey),
        },
      },
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
        uniqueWhere: isUnique ? { arg: schema.arg({ type: schema.Int }) } : undefined,
        create: { arg: schema.arg({ type: schema.Int }) },
        update: { arg: schema.arg({ type: schema.Int }) },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({ type: schema.Int }),
      views: resolveView('integer/views'),
      __legacy,
    });
  };
