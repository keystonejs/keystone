const { CalendarDay, MongoCalendarDayInterface } = require('./Implementation');

module.exports = {
  type: 'CalendarDay',
  implementation: CalendarDay,
  views: {
    Controller: require.resolve('./Controller'),
    Field: require.resolve('./views/Field'),
    Filter: require.resolve('./views/Filter'),
    Cell: require.resolve('./views/Cell'),
  },
  adapters: {
    mongoose: MongoCalendarDayInterface,
  },
};
