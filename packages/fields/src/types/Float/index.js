import {
  Float,
  MongoFloatInterface,
  KnexFloatInterface,
  PrismaFloatInterface,
} from './Implementation';

export default {
  type: 'Float',
  implementation: Float,
  adapters: {
    mongoose: MongoFloatInterface,
    knex: KnexFloatInterface,
    prisma: PrismaFloatInterface,
  },
};
