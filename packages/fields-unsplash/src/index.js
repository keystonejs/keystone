import { importView } from '@keystonejs/build-field-types';
import {
  Unsplash as Implementation,
  MongoUnsplashInterface,
  KnexUnsplashInterface,
} from './views/Implementation';
import { UnsplashBlock } from './UnsplashBlock';

export const Unsplash = {
  type: 'Unsplash',
  implementation: Implementation,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoUnsplashInterface,
    knex: KnexUnsplashInterface,
  },
  blocks: {
    unsplashImage: UnsplashBlock,
  },
};
