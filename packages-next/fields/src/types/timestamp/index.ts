import { DateTimeUtc } from '@keystonejs/fields';

import type { FieldConfig } from '../../interfaces';
import type { FieldType } from '@keystone-next/types';
import type { BaseGeneratedListTypes } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';

export type TimestampFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> & {
  defaultValue?: string;
  isRequired?: boolean;
  isIndexed?: boolean;
  isUnique?: boolean;
};

const views = resolveView('timestamp/views');

export const timestamp = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: TimestampFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: DateTimeUtc,
  config,
  views,
  getBackingType(path: string) {
    return {
      [path]: {
        optional: true,
        type: 'Date | null',
      },
    };
  },
});
