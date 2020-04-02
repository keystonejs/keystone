import { importView } from '@keystonejs/build-field-types';

import {
  CloudinaryImage,
  MongoCloudinaryImageInterface,
  KnexCloudinaryImageInterface,
} from './Implementation';
import { ImageBlock } from './ImageBlock';

export default {
  type: 'CloudinaryImage',
  implementation: CloudinaryImage,
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
