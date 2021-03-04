const { Keystone } = require('@keystone-next/keystone-legacy');
const { GraphQLApp } = require('@keystone-next/app-graphql-legacy');
const { AdminUIApp } = require('@keystone-next/app-admin-ui-legacy');
const { Text } = require('@keystone-next/fields-legacy');
const { MongooseAdapter } = require('@keystone-next/adapter-mongoose-legacy');
const Stars = require('./fields/Stars');
const MultiCheck = require('./fields/MultiCheck');

const keystone = new Keystone({
  adapter: new MongooseAdapter({ mongoUri: 'mongodb://localhost/custom-field' }),
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
  apps: [new GraphQLApp(), new AdminUIApp({ name: 'custom-field', enableDefaultRoute: true })],
};
