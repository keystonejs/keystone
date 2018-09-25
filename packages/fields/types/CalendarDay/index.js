const path = require('path');
const { CalendarDay, MongoCalendarDayInterface } = require('./Implementation');

module.exports = {
  type: 'CalendarDay',
  implementation: CalendarDay,
  views: {
    Controller: path.resolve(__dirname, './Controller'),
    Field: path.resolve(__dirname, './views/Field'),
    Filter: path.resolve(__dirname, './views/Filter'),
    Cell: path.resolve(__dirname, './views/Cell'),
  },
  adapters: {
    mongoose: MongoCalendarDayInterface,
  },
};
