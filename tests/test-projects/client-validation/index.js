const { Keystone } = require('@keystonejs/keystone');
const { Text, Password, Checkbox } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { StaticApp } = require('@keystonejs/app-static');

const { staticRoute, staticPath } = require('./config');

const { PrismaAdapter } = require('@keystonejs/adapter-prisma');

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
