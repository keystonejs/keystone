const { MemoryAdapter } = require('@keystonejs/adapter-memory');
const { Keystone } = require('@keystonejs/keystone');
// const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { Text, Relationship } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { StaticApp } = require('@keystonejs/app-static');

const keystone = new Keystone({
  name: 'Keystone To-Do List',
  adapter: new MemoryAdapter(),
});

keystone.createList('Todo', {
  schemaDoc: 'A list of things which need to be done',
  fields: {
    name: { type: Text, schemaDoc: 'This is the thing you need to do' },
    user: { type: Relationship, ref: 'User.tasks' },
  },
});

keystone.createList('User', {
  schemaDoc: 'An owner of an item',
  fields: {
    name: { type: Text },
    tasks: { type: Relationship, ref: 'Todo.user', many: true },
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
