import {
  DateTime,
  MongoDateTimeInterface,
  KnexDateTimeInterface,
  PrismaDateTimeInterface,
} from './Implementation';

export default {
  type: 'DateTime',
  implementation: DateTime,
  adapters: {
    mongoose: MongoDateTimeInterface,
    knex: KnexDateTimeInterface,
    prisma: PrismaDateTimeInterface,
  },
};
