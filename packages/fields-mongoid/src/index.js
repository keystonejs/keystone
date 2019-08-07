import {
  MongoIdImplementation,
  MongooseMongoIdInterface,
  KnexMongoIdInterface,
} from './Implementation';
import { Text } from '@keystone-alpha/fields';

export const MongoId = {
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

  primaryKeyDefaults: {
    knex: {
      getConfig: () => {
        throw `The Uuid field type doesn't provide a default primary key field configuration for knex. ` +
          `You'll need to supply your own 'id' field for each list or use a different field type for your ` +
          `ids (eg '@keystone-alpha/fields-auto-increment').`;
      },
    },
    mongoose: {
      getConfig: () => ({ type: MongoId }),
    },
  },
};
