import {
  Integer,
  MongoIntegerInterface,
  KnexIntegerInterface,
  PrismaIntegerInterface,
} from './Implementation';

export default {
  type: 'Integer',
  implementation: Integer,
  adapters: {
    mongoose: MongoIntegerInterface,
    knex: KnexIntegerInterface,
    prisma: PrismaIntegerInterface,
  },
};
