import {
  CloudinaryImage,
  MongoCloudinaryImageInterface,
  KnexCloudinaryImageInterface,
} from './Implementation';

import { CloudinaryBlock } from './Block';
import path from 'path';

module.exports = {
  type: 'CloudinaryImage',
  implementation: CloudinaryImage,
  views: {
    Controller: path.join(__dirname, './views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Cell: path.join(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoCloudinaryImageInterface,
    knex: KnexCloudinaryImageInterface,
  },
  block: CloudinaryBlock,
};
