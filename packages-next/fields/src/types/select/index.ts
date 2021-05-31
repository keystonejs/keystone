import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
import { Select, PrismaSelectInterface } from './Implementation';

export type SelectFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  FieldConfig<TGeneratedListTypes> &
    (
      | {
          options: { label: string; value: string }[];
          dataType?: 'string' | 'enum';
          defaultValue?: FieldDefaultValue<string, TGeneratedListTypes>;
        }
      | {
          options: { label: string; value: number }[];
          dataType: 'integer';
          defaultValue?: FieldDefaultValue<number, TGeneratedListTypes>;
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
  type: {
    type: 'Select',
    implementation: Select,
    adapter: PrismaSelectInterface,
  },
  config,
  views: resolveView('select/views'),
  getAdminMeta: () => ({
    options: config.options,
    dataType: config.dataType ?? 'string',
    displayMode: config.ui?.displayMode ?? 'select',
  }),
});
