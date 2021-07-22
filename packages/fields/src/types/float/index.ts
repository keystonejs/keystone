import {
  BaseGeneratedListTypes,
  FieldTypeFunc,
  CommonFieldConfig,
  fieldType,
  schema,
  orderDirectionEnum,
  legacyFilters,
  FieldDefaultValue,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import { getIndexType } from '../../get-index-type';

export type FloatFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<number, TGeneratedListTypes>;
    isRequired?: boolean;
    isIndexed?: boolean;
    isUnique?: boolean;
  };

export const float =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isUnique,
    isRequired,
    defaultValue,
    ...config
  }: FloatFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'Float',
      index: getIndexType({ isIndexed, isUnique }),
    })({
      ...config,
      input: {
        create: { arg: schema.arg({ type: schema.Float }) },
        update: { arg: schema.arg({ type: schema.Float }) },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({ type: schema.Float }),
      views: resolveView('float/views'),
      __legacy: {
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, schema.Float),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, schema.Float),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, schema.Float),
          },
          impls: {
            ...legacyFilters.impls.equalityConditions(meta.fieldKey),
            ...legacyFilters.impls.orderingConditions(meta.fieldKey),
            ...legacyFilters.impls.inConditions(meta.fieldKey),
          },
        },
        isRequired,
        defaultValue,
      },
    });
