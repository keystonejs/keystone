import { Decimal } from '@keystonejs/fields';
import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';

export type Int = number & { __int__: void };

export type DecimalFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  isIndexed?: boolean;
  isUnique?: boolean;
  precision?: Int;
  scale?: Int;
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
    scale: config.precision || null,
  }),
});
