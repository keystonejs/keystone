import 'dotenv/config';
import { relationship, text } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { cloudinaryImage } from '@keystone-6/cloudinary';
import { isSignedIn, permissions } from '../access';

export const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'fake',
  apiKey: process.env.CLOUDINARY_KEY || 'fake',
  apiSecret: process.env.CLOUDINARY_SECRET || 'fake',
  folder: 'sickfits',
};

export const ProductImage = list({
  access: {
    operation: {
      create: isSignedIn,
      query: () => true,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
  },
  fields: {
    image: cloudinaryImage({
      cloudinary,
      label: 'Source',
    }),
    altText: text(),
    product: relationship({ ref: 'Product.photo' }),
  },
  ui: {
    listView: {
      initialColumns: ['image', 'altText', 'product'],
    },
  },
});
