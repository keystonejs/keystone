const { Keystone } = require('@keystonejs/keystone');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { Text, CalendarDay, Virtual } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { StaticApp } = require('@keystonejs/app-static');
const { format, parseISO } = require('date-fns');

class _CalendarDayImpl extends CalendarDay.implementation {
  gqlOutputFieldResolvers() {
    return {
      [`${this.path}`]: item =>
        item[this.path] && format(parseISO(item[this.path]), this.config.gqlFormat),
    };
  }
}
const _CalendarDay = { ...CalendarDay, implementation: _CalendarDayImpl };

const keystone = new Keystone({
  adapter: new MongooseAdapter({ mongoUri: 'mongodb://localhost/todo' }),
});

keystone.createList('Todo', {
  schemaDoc: 'A list of things which need to be done',
  fields: {
    name: { type: Text, schemaDoc: 'This is the thing you need to do', isRequired: true },
    date: { type: CalendarDay, adminDoc: 'For testing only' },
    niceDate: {
      type: Virtual,
      resolver: item => item.date && format(parseISO(item.date), 'do MMMM, yyyy'),
    },
    nicerDate: {
      type: Virtual,
      resolver: (item, { formatAs = 'do MMMM, yyyy' }) =>
        item.date && format(parseISO(item.date), formatAs),
      param: 'formatAs: String',
    },
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: '/', src: 'public' }),
    // Setup the optional Admin UI
    new AdminUIApp({ name: 'Keystone To-Do List', enableDefaultRoute: true }),
  ],
};
