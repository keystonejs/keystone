const { Keystone } = require('@keystone-next/keystone-legacy');
const { Text, Password, Checkbox } = require('@keystone-next/fields-legacy');
const { GraphQLApp } = require('@keystone-next/app-graphql-legacy');
const { AdminUIApp } = require('@keystone-next/app-admin-ui-legacy');
const { StaticApp } = require('@keystone-next/app-static-legacy');

const { PrismaAdapter } = require('@keystone-next/adapter-prisma-legacy');
const { staticRoute, staticPath } = require('./config');

const keystone = new Keystone({
  adapter: new PrismaAdapter(),
  cookieSecret: 'qwerty',
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
    new AdminUIApp({ name: 'Cypress Test Project Client Validation', enableDefaultRoute: true }),
  ],
};
