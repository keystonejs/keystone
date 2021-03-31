import { Decimal, PrismaDecimalInterface } from './Implementation';

export default {
  type: 'Decimal',
  implementation: Decimal,
  adapters: {
    prisma: PrismaDecimalInterface,
  },
};
