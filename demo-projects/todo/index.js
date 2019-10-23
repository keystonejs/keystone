const { Keystone } = require('@keystone/keystone');
const { MongooseAdapter } = require('@keystone/adapter-mongoose');
const { Text } = require('@keystone/fields');
const { GraphQLApp } = require('@keystone/app-graphql');
const { AdminUIApp } = require('@keystone/app-admin-ui');
const { StaticApp } = require('@keystone/app-static');

const keystone = new Keystone({
  name: 'Keystone To-Do List',
  adapter: new MongooseAdapter(),
});

keystone.createList('Todo', {
  schemaDoc: 'A list of things which need to be done',
  fields: {
    name: { type: Text, schemaDoc: 'This is the thing you need to do', isRequired: true },
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: '/', src: 'public' }),
    // Setup the optional Admin UI
    new AdminUIApp({ enableDefaultRoute: true }),
  ],
};
