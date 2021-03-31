import { Virtual, PrismaVirtualInterface } from './Implementation';

export default {
  type: 'Virtual',
  implementation: Virtual,
  adapters: {
    prisma: PrismaVirtualInterface,
  },
};
