import { DateTimeUtc } from '@keystonejs/fields';

import type { FieldConfig } from '../../interfaces';
import type { FieldType } from '@keystone-spike/types';
import type { BaseGeneratedListTypes } from '@keystone-spike/types';

export type TimestampFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> & {
  defaultValue?: string;
  isRequired?: boolean;
  isIndexed?: boolean;
  isUnique?: boolean;
};

export const timestamp = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: TimestampFieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: DateTimeUtc,
  config,
  views: '@keystone-spike/fields/src/types/timestamp/views',
  getBackingType(path: string) {
    return {
      [path]: {
        optional: true,
        type: 'Date | null',
      },
    };
  },
});
