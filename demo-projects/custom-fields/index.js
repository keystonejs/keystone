const { Keystone } = require('@keystonejs/keystone');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { Text } = require('@keystonejs/fields');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const Stars = require('./fields/Stars');
const MultiCheck = require('./fields/MultiCheck');

const keystone = new Keystone({
  name: 'custom-field',
  adapter: new MongooseAdapter(),
});

keystone.createList('Movie', {
  fields: {
    name: { type: Text },
    rating: { type: Stars, starCount: 5 },
    categories: {
      type: MultiCheck,
      options: ['Action', 'Comedy', 'Drama'],
      defaultValue: [true, false, false],
    },
  },
});

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp({ enableDefaultRoute: true })],
};
