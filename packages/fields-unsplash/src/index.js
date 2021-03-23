import {
  Unsplash as Implementation,
  MongoUnsplashInterface,
  KnexUnsplashInterface,
  PrismaUnsplashInterface,
} from './Implementation';

export const Unsplash = {
  type: 'Unsplash',
  implementation: Implementation,
  adapters: {
    mongoose: MongoUnsplashInterface,
    knex: KnexUnsplashInterface,
    prisma: PrismaUnsplashInterface,
  },
};
