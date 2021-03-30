import { Float, PrismaFloatInterface } from './Implementation';

export default {
  type: 'Float',
  implementation: Float,
  adapters: {
    prisma: PrismaFloatInterface,
  },
};
