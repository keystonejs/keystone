import path from 'path';
import {
  Unsplash as Implementation,
  MongoUnsplashInterface,
  KnexUnsplashInterface,
  PrismaUnsplashInterface,
} from './Implementation';

const pkgDir = path.dirname(require.resolve('@keystone-next/fields-unsplash-legacy/package.json'));

export const Unsplash = {
  type: 'Unsplash',
  implementation: Implementation,
  views: {
    Controller: path.join(pkgDir, 'views/Controller'),
    Field: path.join(pkgDir, 'views/Field'),
    Cell: path.join(pkgDir, 'views/Cell'),
  },
  adapters: {
    mongoose: MongoUnsplashInterface,
    knex: KnexUnsplashInterface,
    prisma: PrismaUnsplashInterface,
  },
};
