import { Password, PrismaPasswordInterface } from './Implementation';

export default {
  type: 'Password',
  implementation: Password,
  adapters: {
    prisma: PrismaPasswordInterface,
  },
};
