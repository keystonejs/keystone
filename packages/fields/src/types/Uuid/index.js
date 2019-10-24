import { UuidImplementation, MongoUuidInterface, KnexUuidInterface } from './Implementation';
import { importView } from '@keystonejs/build-field-types';

const Uuid = {
  type: 'Uuid',
  implementation: UuidImplementation,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
  },
  adapters: {
    knex: KnexUuidInterface,
    mongoose: MongoUuidInterface,
  },

  primaryKeyDefaults: {
    knex: {
      getConfig: client => {
        if (client === 'postgres') {
          return {
            type: Uuid,
            knexOptions: { defaultTo: knex => knex.raw('gen_random_uuid()') },
          };
        }
        throw `The Uuid field type doesn't provide a default primary key field configuration for the ` +
          `'${client}' knex client. You'll need to supply your own 'id' field for each list or use a ` +
          `different field type for your ids (eg '@keystonejs/fields-auto-increment').`;
      },
    },
    mongoose: {
      getConfig: () => {
        throw `The Uuid field type doesn't provide a default primary key field configuration for mongoose. ` +
          `You'll need to supply your own 'id' field for each list or use a different field type for your ` +
          `ids (eg '@keystonejs/fields-mongoid').`;
      },
    },
  },
};

export default Uuid;
