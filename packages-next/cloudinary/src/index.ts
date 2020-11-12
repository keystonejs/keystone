// @ts-ignore
import { CloudinaryImage } from '@keystonejs/fields-cloudinary-image';
// @ts-ignore
import { CloudinaryAdapter } from '@keystonejs/file-adapters';
import type { FieldType, FieldConfig } from '@keystone-next/types';
import type { BaseGeneratedListTypes } from '@keystone-next/types';
import path from 'path';

type CloudinaryImageFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> = FieldConfig<
  TGeneratedListTypes
> & {
  isRequired?: boolean;
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder?: string;
  };
};

const views = path.join(
  path.dirname(require.resolve('@keystone-next/cloudinary/package.json')),
  'views'
);

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
  views,
});
