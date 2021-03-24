import {
  DateTimeUtcImplementation,
  MongoDateTimeUtcInterface,
  KnexDateTimeUtcInterface,
  PrismaDateTimeUtcInterface,
} from './Implementation';

export default {
  type: 'DateTimeUtc',
  implementation: DateTimeUtcImplementation,
  adapters: {
    mongoose: MongoDateTimeUtcInterface,
    knex: KnexDateTimeUtcInterface,
    prisma: PrismaDateTimeUtcInterface,
  },
};
