import { Text, PrismaTextInterface } from './Implementation';

export default {
  type: 'Text',
  implementation: Text,
  adapters: {
    prisma: PrismaTextInterface,
  },
};
