import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';
import { Float, PrismaFloatInterface } from './Implementation';

export type FloatFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  isUnique?: boolean;
  defaultValue?: FieldDefaultValue<number>;
};

export const float = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: FloatFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'Float',
    implementation: Float,
    adapter: PrismaFloatInterface,
  },
  config,
  views: resolveView('float/views'),
});
