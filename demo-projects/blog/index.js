//imports for Keystone app core
const { AdminUI } = require('@keystone-alpha/admin-ui');
const { Keystone } = require('@keystone-alpha/keystone');
const { WebServer } = require('@keystone-alpha/server');
const PasswordAuthStrategy = require('@keystone-alpha/keystone/auth/Password');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const WysiwygField = require('@keystone-alpha/fields-wysiwyg-tinymce');
const next = require('next');

const { port, staticRoute, staticPath } = require('./config');
const { User, Post, PostCategory, Comment } = require('./schema');
const initialData = require('./initialData');

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

const adminUI = new AdminUI(keystone, {
  adminPath: '/admin',
  authStrategy,
  pages: [
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
});

const server = new WebServer(keystone, {
  adminUI,
  port,
  static: {
    [staticRoute]: staticPath,
    [WysiwygField.staticRoute]: WysiwygField.staticRoute,
  },
  next: next({
    dir: 'app',
    distDir: 'build',
    dev: process.env.NODE_ENV !== 'production',
  }),
  onStart: async () => {
    // Initialise some data.
    // NOTE: This is only for demo purposes and should not be used in production
    const users = await keystone.lists.User.adapter.findAll();
    if (!users.length) {
      await keystone.createItems(initialData);
    }
  },
});
