import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  CommonFieldConfig,
  fieldType,
  schema,
  orderDirectionEnum,
  FieldTypeFunc,
  legacyFilters,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import { getIndexType } from '../../get-index-type';

export type TextFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<string, TGeneratedListTypes>;
    isIndexed?: boolean;
    isUnique?: boolean;
    isRequired?: boolean;
    ui?: {
      displayMode?: 'input' | 'textarea';
    };
  };

export const text =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isIndexed,
    isUnique,
    isRequired,
    defaultValue,
    ...config
  }: TextFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({
      kind: 'scalar',
      mode: 'optional',
      scalar: 'String',
      index: getIndexType({ isIndexed, isUnique }),
    })({
      ...config,
      input: {
        uniqueWhere: isUnique ? { arg: schema.arg({ type: schema.String }) } : undefined,
        create: { arg: schema.arg({ type: schema.String }) },
        update: { arg: schema.arg({ type: schema.String }) },
        orderBy: { arg: schema.arg({ type: orderDirectionEnum }) },
      },
      output: schema.field({ type: schema.String }),
      views: resolveView('text/views'),
      getAdminMeta() {
        return { displayMode: config.ui?.displayMode ?? 'input' };
      },
      __legacy: {
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, schema.String),
            ...(meta.provider === 'sqlite'
              ? legacyFilters.fields.containsInputFields(meta.fieldKey, schema.String)
              : {
                  ...legacyFilters.fields.stringInputFields(meta.fieldKey, schema.String),
                  ...legacyFilters.fields.equalityInputFieldsInsensitive(
                    meta.fieldKey,
                    schema.String
                  ),
                  ...legacyFilters.fields.stringInputFieldsInsensitive(
                    meta.fieldKey,
                    schema.String
                  ),
                }),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, schema.String),
          },
          impls: {
            ...legacyFilters.impls.equalityConditions(meta.fieldKey),
            ...(meta.provider === 'sqlite'
              ? legacyFilters.impls.containsConditions(meta.fieldKey)
              : {
                  ...legacyFilters.impls.stringConditions(meta.fieldKey),
                  ...legacyFilters.impls.equalityConditionsInsensitive(meta.fieldKey),
                  ...legacyFilters.impls.stringConditionsInsensitive(meta.fieldKey),
                }),
            // These have no case-insensitive counter parts
            ...legacyFilters.impls.inConditions(meta.fieldKey),
          },
        },
        defaultValue,
        isRequired,
      },
    });
