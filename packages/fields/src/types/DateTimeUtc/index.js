import { DateTimeUtcImplementation, PrismaDateTimeUtcInterface } from './Implementation';

export default {
  type: 'DateTimeUtc',
  implementation: DateTimeUtcImplementation,
  adapters: {
    prisma: PrismaDateTimeUtcInterface,
  },
};
