const { Keystone } = require('@keystone-alpha/keystone');
const { Text } = require('@keystone-alpha/fields');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');
const { NuxtApp } = require('@keystone-alpha/app-nuxt');
const {
  MongooseAdapter: Adapter
} = require('@keystone-alpha/adapter-mongoose');

const keystone = new Keystone({
  name: 'nuxt-app',
  adapter: new Adapter()
});

keystone.createList('List', {
  fields: {
    text: { type: Text }
  }
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp(),
    new NuxtApp({
      srcDir: 'src'
    })
  ]
};
