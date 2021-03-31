import { AutoIncrementImplementation, PrismaAutoIncrementInterface } from './Implementation';

export const AutoIncrement = {
  type: 'AutoIncrement',
  implementation: AutoIncrementImplementation,
  adapters: {
    prisma: PrismaAutoIncrementInterface,
  },
};
