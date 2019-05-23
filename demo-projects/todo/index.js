const { Keystone } = require('@keystone-alpha/keystone');
const { MemoryAdapter } = require('@keystone-alpha/adapter-memory');
const { Text } = require('@keystone-alpha/fields');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');
const { StaticApp } = require('@keystone-alpha/app-static');

const keystone = new Keystone({
  name: 'Keystone To-Do List',
  adapter: new MemoryAdapter(),
});

keystone.createList('Todo', {
  schemaDoc: 'A list of things which need to be done',
  fields: {
    name: { type: Text, schemaDoc: 'This is the thing you need to do' },
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
