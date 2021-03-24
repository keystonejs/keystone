import {
  Virtual,
  MongoVirtualInterface,
  KnexVirtualInterface,
  PrismaVirtualInterface,
} from './Implementation';

export default {
  type: 'Virtual',
  implementation: Virtual,
  adapters: {
    mongoose: MongoVirtualInterface,
    knex: KnexVirtualInterface,
    prisma: PrismaVirtualInterface,
  },
};
