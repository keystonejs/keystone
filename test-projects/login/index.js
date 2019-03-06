const { AdminUI } = require('@voussoir/admin-ui');
const { Keystone } = require('@voussoir/keystone');
const { Text, Password, Relationship } = require('@voussoir/fields');
const PasswordAuthStrategy = require('@voussoir/keystone/auth/Password');

const { MongooseAdapter } = require('@voussoir/adapter-mongoose');

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
});

module.exports = {
  keystone,
  admin,
  serverConfig: {
    authStrategy,
  },
};
