import { Integer, PrismaIntegerInterface } from './Implementation';

export default {
  type: 'Integer',
  implementation: Integer,
  adapters: {
    prisma: PrismaIntegerInterface,
  },
};
