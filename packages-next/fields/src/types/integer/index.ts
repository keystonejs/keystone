import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';
import { Integer, PrismaIntegerInterface } from './Implementation';

export type IntegerFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  isUnique?: boolean;
  defaultValue?: FieldDefaultValue<number>;
};

export const integer = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: IntegerFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'Integer',
    implementation: Integer,
    adapter: PrismaIntegerInterface,
  },
  config,
  views: resolveView('integer/views'),
});
