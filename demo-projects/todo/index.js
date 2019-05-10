const { Keystone } = require('@keystone-alpha/keystone');
const { AdminUI } = require('@keystone-alpha/admin-ui');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { Text } = require('@keystone-alpha/fields');
const StaticServer = require('@keystone-alpha/server-static');

const keystone = new Keystone({
  name: 'Keystone To-Do List',
  adapter: new MongooseAdapter(),
});

keystone.createList('Todo', {
  schemaDoc: 'A list of things which need to be done',
  fields: {
    name: { type: Text, schemaDoc: 'This is the thing you need to do' },
  },
});

// Setup the optional Admin UI
const admin = new AdminUI(keystone);

module.exports = {
  keystone,
  servers: [new StaticServer({ route: '/', path: 'public' }), admin],
};
