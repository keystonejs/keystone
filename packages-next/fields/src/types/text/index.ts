import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
import { Text, PrismaTextInterface } from './Implementation';

export type TextFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  defaultValue?: FieldDefaultValue<string>;
  isRequired?: boolean;
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
    adapters: { prisma: PrismaTextInterface },
  },
  config,
  views: resolveView('text/views'),
  getAdminMeta: () => ({ displayMode: config.ui?.displayMode ?? 'input' }),
});
