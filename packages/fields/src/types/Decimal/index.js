import {
  Decimal,
  MongoDecimalInterface,
  KnexDecimalInterface,
  PrismaDecimalInterface,
} from './Implementation';

export default {
  type: 'Decimal',
  implementation: Decimal,
  adapters: {
    mongoose: MongoDecimalInterface,
    knex: KnexDecimalInterface,
    prisma: PrismaDecimalInterface,
  },
};
