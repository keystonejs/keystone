import {
  Password,
  MongoPasswordInterface,
  KnexPasswordInterface,
  PrismaPasswordInterface,
} from './Implementation';

export default {
  type: 'Password',
  implementation: Password,
  adapters: {
    mongoose: MongoPasswordInterface,
    knex: KnexPasswordInterface,
    prisma: PrismaPasswordInterface,
  },
};
