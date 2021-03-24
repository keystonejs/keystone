import { Text, MongoTextInterface, KnexTextInterface, PrismaTextInterface } from './Implementation';

export default {
  type: 'Text',
  implementation: Text,
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
    prisma: PrismaTextInterface,
  },
};
