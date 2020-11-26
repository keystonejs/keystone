import { Text } from '@keystonejs/fields';
import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';

export type TextFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  defaultValue?: FieldDefaultValue<string>;
  isRequired?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
  ui?: {
    displayMode?: 'input' | 'textarea';
  };
};

export const text = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: TextFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: Text,
  config,
  views: resolveView('text/views'),
  getAdminMeta: () => ({ displayMode: config.ui?.displayMode ?? 'input' }),
});
