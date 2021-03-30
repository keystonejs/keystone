// @ts-ignore
import { DateTimeUtc } from '@keystone-next/fields-legacy';
import type { FieldType, BaseGeneratedListTypes, FieldDefaultValue } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';

export type TimestampFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  defaultValue?: FieldDefaultValue<string>;
  isRequired?: boolean;
  isUnique?: boolean;
};

export const timestamp = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: TimestampFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: DateTimeUtc,
  config,
  views: resolveView('timestamp/views'),
});
