import { importView } from '@keystonejs/build-field-types';

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
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Cell: importView('./views/Cell'),
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
