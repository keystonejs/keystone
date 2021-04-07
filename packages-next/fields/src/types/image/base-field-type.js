import { ImageImplementation, PrismaImageInterface } from './Implementation';

export const ImageFieldType = {
  type: 'Image',
  implementation: ImageImplementation,
  adapters: {
    prisma: PrismaImageInterface,
  },
};
