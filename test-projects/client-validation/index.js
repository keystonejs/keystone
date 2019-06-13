const { Keystone } = require('@keystone-alpha/keystone');
const { Text, Password, Checkbox } = require('@keystone-alpha/fields');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');
const { StaticApp } = require('@keystone-alpha/app-static');

const { staticRoute, staticPath } = require('./config');

const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');

const keystone = new Keystone({
  name: 'Cypress Test Project Client Validation',
  adapter: new MongooseAdapter(),
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    password: { type: Password, isRequired: true },
    isAdmin: { type: Checkbox },
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: staticRoute, src: staticPath }),
    new AdminUIApp({ enableDefaultRoute: true }),
  ],
};
