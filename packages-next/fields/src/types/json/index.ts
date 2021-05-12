import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
import { Json, PrismaJsonInterface } from './Implementation';

export type JsonFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  FieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<string>;
    isRequired?: boolean;
    isIndexed?: boolean;
    isUnique?: boolean;
    ui?: {
      displayMode?: 'textarea' | 'input';
    };
  };

export const json = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: JsonFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'Json',
    implementation: Json,
    adapter: PrismaJsonInterface,
  },
  config,
  views: resolveView('json/views'),
  getAdminMeta: () => ({ displayMode: config.ui?.displayMode ?? 'textarea' }),
});
