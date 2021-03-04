//imports for Keystone app core
const { Keystone } = require('@keystone-next/keystone-legacy');
const { PasswordAuthStrategy } = require('@keystone-next/auth-password-legacy');
const { MongooseAdapter } = require('@keystone-next/adapter-mongoose-legacy');
const { GraphQLApp } = require('@keystone-next/app-graphql-legacy');
const { AdminUIApp } = require('@keystone-next/app-admin-ui-legacy');
const { NextApp } = require('@keystone-next/app-next-legacy');
const { StaticApp } = require('@keystone-next/app-static-legacy');
const { createItems } = require('@keystone-next/server-side-graphql-client-legacy');

const { staticRoute, staticPath, distDir } = require('./config');
const { User, Post, PostCategory, Comment } = require('./schema');

const keystone = new Keystone({
  adapter: new MongooseAdapter({ mongoUri: 'mongodb://localhost/keystone-demo-blog' }),
  onConnect: async () => {
    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      const initialData = require('./initialData');
      await createItems({ keystone, listKey: 'User', items: initialData.User });
    }
  },
});

keystone.createList('User', User);
keystone.createList('Post', Post);
keystone.createList('PostCategory', PostCategory);
keystone.createList('Comment', Comment);

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: { protectIdentities: process.env.NODE_ENV === 'production' },
});

const adminApp = new AdminUIApp({
  name: 'Keystone Demo Blog',
  adminPath: '/admin',
  hooks: require.resolve('./admin/'),
  authStrategy,
  isAccessAllowed: ({ authentication: { item: user } }) => !!user && !!user.isAdmin,
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: staticRoute, src: staticPath }),
    adminApp,
    new NextApp({ dir: 'app' }),
  ],
  distDir,
};
