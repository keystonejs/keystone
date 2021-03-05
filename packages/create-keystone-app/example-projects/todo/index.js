const { Keystone } = require('@keystone-next/keystone-legacy');
const { Text } = require('@keystone-next/fields-legacy');
const { GraphQLApp } = require('@keystone-next/app-graphql-legacy');
const { AdminUIApp } = require('@keystone-next/app-admin-ui-legacy');
const { StaticApp } = require('@keystone-next/app-static-legacy');

/* keystone-cli: generated-code */
const { MongooseAdapter: Adapter } = require('@keystone-next/adapter-mongoose-legacy');
const PROJECT_NAME = 'My KeystoneJS Project';
const adapterConfig = {};
/* /keystone-cli: generated-code */

const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
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
    new AdminUIApp({ name: PROJECT_NAME, enableDefaultRoute: true }),
  ],
};
