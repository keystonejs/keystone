import { resolveView } from './resolve-view';

import {
  CloudinaryImage as Implementation,
  MongoCloudinaryImageInterface,
  KnexCloudinaryImageInterface,
} from './Implementation';
import { ImageBlock } from './ImageBlock';

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
  },
  blocks: {
    image: ImageBlock,
    // gallery: {
    //   type: 'cloudinaryGallery',
    // },
  },
};
