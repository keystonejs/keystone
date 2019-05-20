//imports for Keystone app core
const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const GraphQLApi = require('@keystone-alpha/app-graphql');
const AdminUI = require('@keystone-alpha/app-admin');
const NextApp = require('@keystone-alpha/app-next');
const StaticApp = require('@keystone-alpha/app-static');

const { staticRoute, staticPath } = require('./config');
const { User, Post, PostCategory, Comment } = require('./schema');

const keystone = new Keystone({
  name: 'Keystone Demo Blog',
  adapter: new MongooseAdapter(),
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

keystone.createList('User', User);
keystone.createList('Post', Post);
keystone.createList('PostCategory', PostCategory);
keystone.createList('Comment', Comment);

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  authStrategy,
  pages: [
    {
      label: 'About this project',
      path: 'about',
      component: require.resolve('./admin/pages/about'),
    },
    {
      label: 'Blog',
      children: [
        { listKey: 'Post' },
        { label: 'Categories', listKey: 'PostCategory' },
        { listKey: 'Comment' },
      ],
    },
    {
      label: 'People',
      children: ['User'],
    },
  ],
  disableDefaultRoute: true,
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApi(),
    admin,
    new StaticApp({ path: staticRoute, src: staticPath }),
    new NextApp({ dir: 'app' }),
  ],
};
