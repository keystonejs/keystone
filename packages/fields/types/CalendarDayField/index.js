const {
  CalendarDay,
  MongoCalendarDayInterface,
  KnexCalendarDayInterface,
} = require('./Implementation');

module.exports = {
  type: 'CalendarDay',
  implementation: CalendarDay,
  // Peer Dependency
  views: '@voussoir/admin-view-calendar-day',
  adapters: {
    mongoose: MongoCalendarDayInterface,
    knex: KnexCalendarDayInterface,
  },
};
