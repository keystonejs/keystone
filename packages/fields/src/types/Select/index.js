import { Select, PrismaSelectInterface } from './Implementation';

export default {
  type: 'Select',
  implementation: Select,
  adapters: {
    prisma: PrismaSelectInterface,
  },
};
