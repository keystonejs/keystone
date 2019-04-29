import { importView } from '@keystone-alpha/build-field-types';

import {
  CloudinaryImage,
  MongoCloudinaryImageInterface,
  KnexCloudinaryImageInterface,
} from './Implementation';
import { ImageBlock } from './ImageBlock';
import imageContainer from '../Content/blocks/image-container';

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
    image: {
      type: 'cloudinaryImage',
      viewPath: imageContainer.viewPath,
      implementation: ImageBlock,
    },
  },
};
