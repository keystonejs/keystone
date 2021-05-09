import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
import { Integer, PrismaIntegerInterface } from './Implementation';

export type IntegerFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
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
