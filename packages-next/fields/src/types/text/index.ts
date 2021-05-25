import {
  BaseGeneratedListTypes,
  FieldDefaultValue,
  fieldType,
  types,
  orderDirectionEnum,
  FieldTypeFunc,
  filters,
  legacyFilters,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';

export type TextFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<string>;
    index?: 'index' | 'unique';
    ui?: {
      displayMode?: 'input' | 'textarea';
    };
  };

export const text =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    index,
    ...config
  }: TextFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta =>
    fieldType({ kind: 'scalar', mode: 'optional', scalar: 'String', index })({
      ...config,
      input: {
        where: { arg: types.arg({ type: filters[meta.provider].String.optional }) },
        uniqueWhere: index === 'unique' ? { arg: types.arg({ type: types.String }) } : undefined,
        create: { arg: types.arg({ type: types.String }) },
        update: { arg: types.arg({ type: types.String }) },
        orderBy: { arg: types.arg({ type: orderDirectionEnum }) },
      },
      output: types.field({ type: types.String }),
      views: resolveView('text/views'),
      getAdminMeta() {
        return { displayMode: config.ui?.displayMode ?? 'input' };
      },
      __legacy: {
        filters: {
          fields: {
            ...legacyFilters.fields.equalityInputFields(meta.fieldKey, types.String),
            ...(meta.provider === 'sqlite'
              ? legacyFilters.fields.containsInputFields(meta.fieldKey, types.String)
              : {
                  ...legacyFilters.fields.stringInputFields(meta.fieldKey, types.String),
                  ...legacyFilters.fields.equalityInputFieldsInsensitive(
                    meta.fieldKey,
                    types.String
                  ),
                  ...legacyFilters.fields.stringInputFieldsInsensitive(meta.fieldKey, types.String),
                }),
            ...legacyFilters.fields.inInputFields(meta.fieldKey, types.String),
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
      },
    });
