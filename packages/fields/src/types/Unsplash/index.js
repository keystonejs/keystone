import { importView } from '@keystone-alpha/build-field-types';
import { Unsplash, MongoUnsplashInterface, KnexUnsplashInterface } from './Implementation';
import { UnsplashBlock } from './UnsplashBlock';

export default {
  type: 'Unsplash',
  implementation: Unsplash,
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
