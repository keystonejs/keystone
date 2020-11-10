import { Text } from '@keystonejs/fields';

import type { FieldConfig } from '../../interfaces';
import type { FieldType } from '@keystone-next/types';
import type { BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

export type SelectFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> &
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

const views = resolveView('select/views');

export const select = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: SelectFieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: Text,
  config,
  getAdminMeta: () => ({
    options: config.options,
    dataType: config.dataType ?? 'string',
    displayMode: config.ui?.displayMode ?? 'select',
  }),
  views,
  getBackingType(path: string) {
    return {
      [path]: {
        optional: true,
        type: 'string | null',
      },
    };
  },
});
