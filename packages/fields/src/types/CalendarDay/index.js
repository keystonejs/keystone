const {
  CalendarDay,
  MongoCalendarDayInterface,
  KnexCalendarDayInterface,
} = require('./Implementation');
const path = require('path');

module.exports = {
  type: 'CalendarDay',
  implementation: CalendarDay,
  views: {
    Controller: path.join(__dirname, './views/Controller'),
    Field: path.join(__dirname, './views/Field'),
    Filter: path.join(__dirname, './views/Filter'),
    Cell: path.join(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoCalendarDayInterface,
    knex: KnexCalendarDayInterface,
  },
};
