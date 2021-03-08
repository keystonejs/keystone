import { resolveView } from './resolve-view';

import {
  CloudinaryImage as Implementation,
  MongoCloudinaryImageInterface,
  KnexCloudinaryImageInterface,
  PrismaCloudinaryImageInterface,
} from './Implementation';

export const CloudinaryImage = {
  type: 'CloudinaryImage',
  implementation: Implementation,
  views: {
    Controller: resolveView('views/Controller'),
    Field: resolveView('views/Field'),
    Cell: resolveView('views/Cell'),
  },
  adapters: {
    mongoose: MongoCloudinaryImageInterface,
    knex: KnexCloudinaryImageInterface,
    prisma: PrismaCloudinaryImageInterface,
  },
};
