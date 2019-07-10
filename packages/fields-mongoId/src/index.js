import {
  MongoIdImplementation,
  MongooseMongoIdInterface,
  KnexMongoIdInterface,
} from './Implementation';
import { Text } from '@keystone-alpha/fields';

export let MongoId = {
  type: 'MongoId',
  implementation: MongoIdImplementation,
  views: {
    Controller: Text.views.Controller,
    Field: Text.views.Field,
    Filter: Text.views.Filter,
  },
  adapters: {
    knex: KnexMongoIdInterface,
    mongoose: MongooseMongoIdInterface,
  },
};
