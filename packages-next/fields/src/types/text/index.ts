import { Text } from '@keystonejs/fields';

import type { FieldConfig } from '../../interfaces';
import type { FieldType } from '@keystone-next/types';
import type { BaseGeneratedListTypes } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

export type TextFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> & {
  defaultValue?: string;
  isRequired?: boolean;
  isUnique?: boolean;
  admin?: {
    displayMode?: 'input' | 'textarea';
  };
};

const views = resolveView('text/views');

export const text = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: TextFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: Text,
  config,
  getAdminMeta: () => ({
    displayMode: config.admin?.displayMode ?? 'input',
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
