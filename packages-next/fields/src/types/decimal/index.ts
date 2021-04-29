import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { CommonFieldConfig } from '../../interfaces';
import { Decimal, PrismaDecimalInterface } from './Implementation';

export type DecimalFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = CommonFieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  isUnique?: boolean;
  precision?: number;
  scale?: number;
  defaultValue?: FieldDefaultValue<string>;
};

export const decimal = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: DecimalFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'Decimal',
    implementation: Decimal,
    adapter: PrismaDecimalInterface,
  },
  config,
  views: resolveView('decimal/views'),
  getAdminMeta: () => ({
    precision: config.precision || null,
    scale: config.scale || null,
  }),
});
