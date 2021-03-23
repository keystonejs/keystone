import {
  CalendarDay,
  MongoCalendarDayInterface,
  KnexCalendarDayInterface,
  PrismaCalendarDayInterface,
} from './Implementation';

export default {
  type: 'CalendarDay',
  implementation: CalendarDay,
  adapters: {
    mongoose: MongoCalendarDayInterface,
    knex: KnexCalendarDayInterface,
    prisma: PrismaCalendarDayInterface,
  },
};
