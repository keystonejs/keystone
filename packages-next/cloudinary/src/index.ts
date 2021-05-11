import path from 'path';
import type { FieldType, CommonFieldConfig, BaseGeneratedListTypes } from '@keystone-next/types';
import { CloudinaryAdapter } from './cloudinary';
import { CloudinaryImage, PrismaCloudinaryImageInterface } from './Implementation';

type CloudinaryImageFieldConfig<TGeneratedListTypes extends BaseGeneratedListTypes> =
  CommonFieldConfig<TGeneratedListTypes> & {
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
  type: {
    type: 'CloudinaryImage',
    implementation: CloudinaryImage,
    adapter: PrismaCloudinaryImageInterface,
  },
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
