import {
  CloudinaryImage as Implementation,
  PrismaCloudinaryImageInterface,
} from './Implementation';

export const CloudinaryImage = {
  type: 'CloudinaryImage',
  implementation: Implementation,
  adapters: {
    prisma: PrismaCloudinaryImageInterface,
  },
};
