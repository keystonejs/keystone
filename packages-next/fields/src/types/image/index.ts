import type { FieldType, BaseGeneratedListTypes } from '@keystone-next/types';
import { resolveView } from '../../resolve-view';
import type { FieldConfig } from '../../interfaces';
import { ImageImplementation, PrismaImageInterface } from './Implementation';
import { ImageFieldType } from './base-field-type';

export type ImageFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  // not sure if this would or should work
  // defaultValue?: FieldDefaultValue<ImageInput>;
};

export const image = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: ImageFieldConfig<TGeneratedListTypes> = {}
): FieldType<TGeneratedListTypes> => ({
  type: {
    type: 'Image',
    implementation: ImageImplementation,
    adapter: PrismaImageInterface,
  },
  config,
  views: resolveView('image/views'),
});
