import {
  MongoIdImplementation,
  MongooseMongoIdInterface,
  KnexMongoIdInterface,
  PrismaMongoIdInterface,
} from './Implementation';

export const MongoId = {
  type: 'MongoId',
  implementation: MongoIdImplementation,
  adapters: {
    knex: KnexMongoIdInterface,
    mongoose: MongooseMongoIdInterface,
    prisma: PrismaMongoIdInterface,
  },

  primaryKeyDefaults: {
    knex: {
      getConfig: () => {
        throw (
          `The MongoId field type doesn't provide a default primary key field configuration for knex. ` +
          `You'll need to supply your own 'id' field for each list or use a different field type for your ` +
          `ids (eg '@keystone-next/fields-auto-increment-legacy').`
        );
      },
    },
    prisma: {
      getConfig: () => {
        throw (
          `The MongoId field type doesn't provide a default primary key field configuration for Prisma. ` +
          `You'll need to supply your own 'id' field for each list or use a different field type for your ` +
          `ids (eg '@keystone-next/fields-auto-increment-legacy').`
        );
      },
    },
    mongoose: {
      getConfig: () => ({ type: MongoId }),
    },
  },
};
