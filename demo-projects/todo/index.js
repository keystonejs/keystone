const { Keystone } = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { Text } = require('@keystone-alpha/fields');
const GraphQLApi = require('@keystone-alpha/app-graphql');
const AdminUI = require('@keystone-alpha/app-admin');
const StaticApp = require('@keystone-alpha/app-static');

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
  apps: [new GraphQLApi(), new StaticApp({ route: '/', path: 'public' }), admin],
};
