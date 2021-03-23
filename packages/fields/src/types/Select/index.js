import {
  Select,
  MongoSelectInterface,
  KnexSelectInterface,
  PrismaSelectInterface,
} from './Implementation';

export default {
  type: 'Select',
  implementation: Select,
  adapters: {
    mongoose: MongoSelectInterface,
    knex: KnexSelectInterface,
    prisma: PrismaSelectInterface,
  },
};
