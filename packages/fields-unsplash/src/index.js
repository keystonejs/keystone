import path from 'path';
import {
  Unsplash as Implementation,
  MongoUnsplashInterface,
  KnexUnsplashInterface,
} from './Implementation';
import { UnsplashBlock } from './UnsplashBlock';

const pkgDir = path.dirname(__dirname);

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
  },
  blocks: {
    unsplashImage: UnsplashBlock,
  },
};
