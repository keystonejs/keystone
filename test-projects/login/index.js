const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Password, Relationship, Checkbox } = require('@keystonejs/fields');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');

const {
  createdAt,
  createdBy,
  updatedAt,
  updatedBy,
  atTracking,
  byTracking,
} = require('@keystonejs/list-plugins');

const defaultAccess = ({ authentication: { item } }) => !!item;

const keystone = new Keystone({
  adapter: new MongooseAdapter({ mongoUri: 'mongodb://localhost/cypress-test-project' }),
  cookieSecret: 'qwerty',
  defaultAccess: {
    list: defaultAccess,
  },
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    password: { type: Password },
    isAdmin: { type: Checkbox },
  },
  labelResolver: item => `${item.name} <${item.email}>`,
  access: {
    create: defaultAccess,
    read: defaultAccess,
    update: defaultAccess,
    delete: defaultAccess,
    auth: true,
  },
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    author: { type: Relationship, ref: 'User' },
    editors: { type: Relationship, ref: 'User', many: true },
  },
});

keystone.createList('ListWithPlugin', {
  fields: {
    text: { type: Text },
  },
  plugins: [
    atTracking(),
    createdAt({ createdAtField: 'whenCreated' }),
    updatedAt({ updatedAtField: 'whenUpdated' }),
    byTracking({
      createdByField: 'creator',
      updatedByField: 'updater',
    }),
    createdBy(),
    updatedBy(),
  ],
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  // config: { protectIdentities: true },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: 'Cypress Test Project For Login',
      adminPath: '/admin',
      authStrategy,
      isAccessAllowed: ({ authentication: { item, listKey } }) =>
        !!item && listKey === 'User' && !!item.isAdmin,
    }),
  ],
};
