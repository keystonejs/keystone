import { importView } from '@keystonejs/build-field-types';
import { CalendarDay, MongoCalendarDayInterface, KnexCalendarDayInterface } from './Implementation';

export default {
  type: 'CalendarDay',
  implementation: CalendarDay,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
    Cell: importView('./views/Cell'),
  },
  adapters: {
    mongoose: MongoCalendarDayInterface,
    knex: KnexCalendarDayInterface,
  },
};
