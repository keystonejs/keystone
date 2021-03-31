// @ts-ignore
import { Decimal } from '@keystone-next/fields-legacy';
import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';

export type DecimalFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  isUnique?: boolean;
  precision?: number;
  scale?: number;
  defaultValue?: FieldDefaultValue<string>;
};

export const decimal = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: DecimalFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: Decimal,
  config,
  views: resolveView('decimal/views'),
  getAdminMeta: () => ({
    precision: config.precision || null,
    scale: config.scale || null,
  }),
});
