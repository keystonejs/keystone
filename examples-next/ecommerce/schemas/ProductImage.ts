import 'dotenv/config';
import { cloudinaryImage } from '@keystone-next/cloudinary';
import { relationship, text } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { permissions } from '../access';


export const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_KEY || '',
  apiSecret: process.env.CLOUDINARY_SECRET || '',
};


export const ProductImage = list({
  access: {
    create: permissions.canManageProducts,
    read: true,
    update: permissions.canManageProducts,
    delete: permissions.canManageProducts,
  },
  ui: {
    isHidden: true,
  },
  fields: {
    product: relationship({ ref: 'Product.photo' }),
    image: cloudinaryImage({
      cloudinary,
      label: 'Source',
    }),
    altText: text(),
  },
});
