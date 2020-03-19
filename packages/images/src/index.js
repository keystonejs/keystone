import { importView } from '@keystonejs/build-field-types';

import {
  Image as ImageImplementation,
  MongoImageInterface,
  KnexImageInterface,
} from './Implementation';

export { ImageService } from './service';

export const Image = {
  type: 'Image',
  implementation: ImageImplementation,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoImageInterface,
    knex: KnexImageInterface,
  },
};
