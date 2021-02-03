import {
  UuidImplementation,
  MongoUuidInterface,
  KnexUuidInterface,
  PrismaUuidInterface,
} from './Implementation';
import { resolveView } from '../../resolve-view';

const Uuid = {
  type: 'Uuid',
  implementation: UuidImplementation,
  views: {
    Controller: resolveView('types/Uuid/views/Controller'),
    Field: resolveView('types/Uuid/views/Field'),
    Filter: resolveView('types/Uuid/views/Filter'),
  },
  adapters: {
    knex: KnexUuidInterface,
    mongoose: MongoUuidInterface,
    prisma: PrismaUuidInterface,
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
        throw (
          `The Uuid field type doesn't provide a default primary key field configuration for the ` +
          `'${client}' knex client. You'll need to supply your own 'id' field for each list or use a ` +
          `different field type for your ids (eg '@keystonejs/fields-auto-increment').`
        );
      },
    },
    prisma: {
      getConfig: client => {
        throw (
          `The Uuid field type doesn't provide a default primary key field configuration for the ` +
          `'${client}' prisma client. You'll need to supply your own 'id' field for each list or use a ` +
          `different field type for your ids (eg '@keystonejs/fields-auto-increment').`
        );
      },
    },
    mongoose: {
      getConfig: () => {
        throw (
          `The Uuid field type doesn't provide a default primary key field configuration for mongoose. ` +
          `You'll need to supply your own 'id' field for each list or use a different field type for your ` +
          `ids (eg '@keystonejs/fields-mongoid').`
        );
      },
    },
  },
};

export default Uuid;
