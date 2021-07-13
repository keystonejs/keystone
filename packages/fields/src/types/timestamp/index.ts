import {
  BaseGeneratedListTypes,
  fieldType,
  schema,
  FieldTypeFunc,
  CommonFieldConfig,
  orderDirectionEnum,
  legacyFilters,
  FieldDefaultValue,
  filters,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import { getIndexType } from '../../get-index-type';

export type TimestampFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    isIndexed?: boolean;
    isUnique?: boolean;
    isRequired?: boolean;
    defaultValue?: FieldDefaultValue<string, TGeneratedListTypes>;
  };

export const timestamp =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isUnique,
    isRequired,
    defaultValue,
    ...config
  }: TimestampFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    const inputResolver = (value: string | null | undefined) => {
      if (value === null || value === undefined) {
        return value;
      }
      return new Date(value);
    };
    return fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'DateTime',
      index: getIndexType({ isUnique, isIndexed }),
    })({
      ...config,
      input: {
        where: { arg: schema.arg({ type: filters[meta.provider].DateTime.optional }) },
        create: { arg: schema.arg({ type: schema.String }), resolve: inputResolver },
        update: { arg: schema.arg({ type: schema.String }), resolve: inputResolver },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({
        type: schema.String,
        resolve({ value }) {
          if (value === null) return null;
          return value.toISOString();
        },
      }),
      views: resolveView('timestamp/views'),
      __legacy: {
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, schema.String),
            ...legacyFilters.fields.orderingInputFields(meta.fieldKey, schema.String),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, schema.String),
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
  };
