import { resolveView } from '../../resolve-view';
import {
  CalendarDay,
  MongoCalendarDayInterface,
  KnexCalendarDayInterface,
  PrismaCalendarDayInterface,
} from './Implementation';

export default {
  type: 'CalendarDay',
  implementation: CalendarDay,
  views: {
    Controller: resolveView('types/CalendarDay/views/Controller'),
    Field: resolveView('types/CalendarDay/views/Field'),
    Filter: resolveView('types/CalendarDay/views/Filter'),
    Cell: resolveView('types/CalendarDay/views/Cell'),
  },
  adapters: {
    mongoose: MongoCalendarDayInterface,
    knex: KnexCalendarDayInterface,
    prisma: PrismaCalendarDayInterface,
  },
};
