import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
import { Text, PrismaTextInterface } from './Implementation';

export type TextFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  FieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<string, TGeneratedListTypes>;
    isRequired?: boolean;
    isIndexed?: boolean;
    isUnique?: boolean;
    ui?: {
      displayMode?: 'input' | 'textarea';
    };
  };

export const text = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: TextFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'Text',
    implementation: Text,
    adapter: PrismaTextInterface,
  },
  config,
  views: resolveView('text/views'),
  getAdminMeta: () => ({ displayMode: config.ui?.displayMode ?? 'input' }),
});
