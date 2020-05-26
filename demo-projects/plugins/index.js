const { Keystone } = require('@keystonejs/keystone');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { Text, Password, Checkbox } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { generateAccessControlPlugin, userIsAdmin } = require('./plugin-access-control');

const keystone = new Keystone({
  name: 'Keystone Plugin Demo',
  adapter: new MongooseAdapter(),
  onConnect: async keystone => {
    // Create a demo user
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      await keystone.createItems({
        User: [
          {
            name: 'Admin',
            email: 'admin@keystonejs.com',
            password: '12345678',
            isAdmin: true, // This is the root admin account
          },
          {
            name: 'User',
            email: 'user@keystonejs.com',
            password: '12345678',
          },
        ],
      });
    }
  },
});

keystone.createList('Role', {
  fields: {
    name: { type: Text },
  },
  access: {
    read: true, // Read access must be true
    create: userIsAdmin,
    update: userIsAdmin,
    delete: userIsAdmin,
  },
});

const { requiresRoles: userRequiresRoles, hasRoles: userHasRoles } = generateAccessControlPlugin(
  'User',
  {
    keystone,
    roleRef: 'Role',
  }
);

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
    },
    isAdmin: { type: Checkbox },
    password: {
      type: Password,
    },
  },
  plugins: [userHasRoles, userRequiresRoles],
});

const { requiresRoles: postRequiresRoles } = generateAccessControlPlugin('Post', {
  keystone,
  settingRef: 'Setting',
  roleRef: 'Role',
});

keystone.createList('Post', {
  fields: {
    name: { type: Text },
  },
  plugins: [postRequiresRoles],
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp({ enableDefaultRoute: true, authStrategy })],
};
