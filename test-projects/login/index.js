const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');
const { Text, Password, Relationship } = require('@keystone-alpha/fields');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const GraphQLApi = require('@keystone-alpha/app-graphql');
const AdminUI = require('@keystone-alpha/app-admin');
const StaticApp = require('@keystone-alpha/app-static');

const { staticRoute, staticPath } = require('./config');

const keystone = new Keystone({
  name: 'Cypress Test Project For Login',
  adapter: new MongooseAdapter(),
  defaultAccess: {
    list: ({ authentication: { item } }) => !!item,
  },
});

// eslint-disable-next-line no-unused-vars
const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  // config: { protectIdentities: true },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    password: { type: Password },
  },
  labelResolver: item => `${item.name} <${item.email}>`,
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    author: { type: Relationship, ref: 'User' },
    editors: { type: Relationship, ref: 'User', many: true },
  },
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  authStrategy,
});

module.exports = {
  keystone,
  apps: [new GraphQLApi(), admin, new StaticApp({ route: staticRoute, path: staticPath })],
};
