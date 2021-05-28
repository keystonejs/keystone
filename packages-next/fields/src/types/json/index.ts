import type {
  FieldType,
  BaseGeneratedListTypes,
  FieldDefaultValue,
  JSONValue,
} from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
import { Json, PrismaJsonInterface } from './Implementation';

export type JsonFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  FieldConfig<TGeneratedListTypes> & {
    defaultValue?: FieldDefaultValue<JSONValue, TGeneratedListTypes>;
    isRequired?: boolean;
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
});
