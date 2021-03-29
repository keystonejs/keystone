// @ts-ignore
import { Text } from '@keystone-next/fields-legacy';
import type { FieldType, BaseGeneratedListTypes } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';

export type ImageFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  isIndexed?: boolean;
};

export const image = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: ImageFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: Text,
  config,
  views: resolveView('image/views'),
  getAdminMeta: () => ({
    /* ?? */
  }),
});
