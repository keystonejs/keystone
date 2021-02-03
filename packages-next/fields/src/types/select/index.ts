import { Text } from '@keystonejs/fields';
import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';

export type SelectFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> &
  (
    | {
        options: { label: string; value: string }[];
        dataType?: 'string' | 'enum';
        defaultValue?: FieldDefaultValue<string>;
      }
    | {
        options: { label: string; value: number }[];
        dataType: 'integer';
        defaultValue?: FieldDefaultValue<number>;
      }
  ) & {
    ui?: {
      displayMode?: 'select' | 'segmented-control';
    };
    isRequired?: boolean;
    isIndexed?: boolean;
    isUnique?: boolean;
  };

export const select = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: SelectFieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: Text,
  config,
  views: resolveView('select/views'),
  getAdminMeta: () => ({
    options: config.options,
    dataType: config.dataType ?? 'string',
    displayMode: config.ui?.displayMode ?? 'select',
  }),
});
