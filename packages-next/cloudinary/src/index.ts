import path from 'path';
// @ts-ignore
import { CloudinaryImage } from '@keystone-next/fields-cloudinary-image-legacy';
import { CloudinaryAdapter } from '@keystone-next/file-adapters-legacy';
import type { FieldType, FieldConfig, BaseGeneratedListTypes } from '@keystone-next/types';

type CloudinaryImageFieldConfig<
  TGeneratedListTypes extends BaseGeneratedListTypes
> = FieldConfig<TGeneratedListTypes> & {
  isRequired?: boolean;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder?: string;
  };
};

export const cloudinaryImage = <TGeneratedListTypes extends BaseGeneratedListTypes>({
  cloudinary,
  ...config
}: CloudinaryImageFieldConfig<TGeneratedListTypes>): FieldType<TGeneratedListTypes> => ({
  type: CloudinaryImage,
  config: {
    ...config,
    // @ts-ignore
    adapter: new CloudinaryAdapter(cloudinary),
  },
  views: path.join(
    path.dirname(require.resolve('@keystone-next/cloudinary/package.json')),
    'views'
  ),
});
