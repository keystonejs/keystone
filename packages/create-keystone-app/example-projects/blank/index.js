const { Keystone } = require('@keystone-alpha/keystone');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');
/* keystone-cli: generated-code */
const { MongooseAdapter: Adapter } = require('@keystone-alpha/adapter-mongoose');
const PROJECT_NAME = 'My KeystoneJS Project';
/* /keystone-cli: generated-code */

/**
 * You've got a new KeystoneJS Project! Things you might want to do next:
 * - Add adapter config options (See: https://v5.keystonejs.com/keystone-alpha/adapter-mongoose/)
 * - Select configure access control and authentication (See: https://v5.keystonejs.com/api/access-control)
 */

const keystone = new Keystone({
  name: PROJECT_NAME,
  adapter: new Adapter(),
});

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp({ enableDefaultRoute: true })],
};
