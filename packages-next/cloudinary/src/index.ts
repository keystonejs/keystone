// @ts-ignore
import { CloudinaryImage } from '@keystonejs/fields-cloudinary-image';
import type { FieldType, FieldConfig } from '@keystone-next/types';
import type { BaseGeneratedListTypes } from '@keystone-next/types';
import path from 'path';

type CloudinaryImageFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> & {
  isRequired?: boolean;
  adapter: any;
};

const views = path.join(
  path.dirname(require.resolve('@keystone-next/cloudinary/package.json')),
  'views'
);

export const cloudinaryImage = <TGeneratedListTypes extends BaseGeneratedListTypes>(
  config: CloudinaryImageFieldConfig<TGeneratedListTypes>
): FieldType<TGeneratedListTypes> => ({
  type: CloudinaryImage,
  config: config,
  views,
  getBackingType(path) {
    return {
      [path]: {
        optional: true,
        type: 'any',
      },
    };
  },
});
