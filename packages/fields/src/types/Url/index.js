import {
  Text,
  MongoTextInterface,
  KnexTextInterface,
  PrismaTextInterface,
} from '../Text/Implementation';

export default {
  type: 'Url',
  implementation: Text,
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
    prisma: PrismaTextInterface,
  },
};
