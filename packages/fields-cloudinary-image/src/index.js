import {
  CloudinaryImage as Implementation,
  MongoCloudinaryImageInterface,
  KnexCloudinaryImageInterface,
  PrismaCloudinaryImageInterface,
} from './Implementation';

export const CloudinaryImage = {
  type: 'CloudinaryImage',
  implementation: Implementation,
  adapters: {
    mongoose: MongoCloudinaryImageInterface,
    knex: KnexCloudinaryImageInterface,
    prisma: PrismaCloudinaryImageInterface,
  },
};
