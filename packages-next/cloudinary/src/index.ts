import path from 'path';
// @ts-ignore
import { CloudinaryAdapter } from '@keystone-next/file-adapters-legacy';
import type { FieldType, FieldConfig, BaseGeneratedListTypes } from '@keystone-next/types';
import { CloudinaryImage, PrismaCloudinaryImageInterface } from './Implementation';

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
  type: {
    type: 'CloudinaryImage',
    implementation: CloudinaryImage,
    adapters: { prisma: PrismaCloudinaryImageInterface },
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
