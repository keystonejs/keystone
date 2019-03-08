const {
  CalendarDay,
  MongoCalendarDayInterface,
  KnexCalendarDayInterface,
} = require('./Implementation');

module.exports = {
  type: 'CalendarDay',
  implementation: CalendarDay,
  views: {
    Controller: '@keystone-alpha/fields/types/CalendarDay/views/Controller',
    Field: '@keystone-alpha/fields/types/CalendarDay/views/Field',
    Filter: '@keystone-alpha/fields/types/CalendarDay/views/Filter',
    Cell: '@keystone-alpha/fields/types/CalendarDay/views/Cell',
  },
  adapters: {
    mongoose: MongoCalendarDayInterface,
    knex: KnexCalendarDayInterface,
  },
};
