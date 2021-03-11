import {
  JsonImplementation,
  PrismaJsonInterface,
  KnexJsonInterface,
  MongoJsonInterface,
} from './Implementation';

export const JsonFieldType = {
  type: 'Json',
  implementation: JsonImplementation,
  adapters: {
    prisma: PrismaJsonInterface,
    knex: KnexJsonInterface,
    mongoose: MongoJsonInterface,
  },
};
