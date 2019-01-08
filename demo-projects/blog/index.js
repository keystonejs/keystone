//imports for Next.js app core
const next = require('next');
const nextApp = next({
  dir: 'app',
  distDir: 'build',
  dev: process.env.NODE_ENV !== 'PRODUCTION',
});

//imports for Keystone app core
const { AdminUI } = require('@voussoir/admin-ui');
const { Keystone } = require('@voussoir/core');
const {
  File,
  Text,
  Relationship,
  Select,
  Password,
  Checkbox,
  CalendarDay,
  CloudinaryImage,
  DateTime,
  Url,
} = require('@voussoir/fields');
const { WebServer } = require('@voussoir/server');
const { CloudinaryAdapter, LocalFileAdapter } = require('@voussoir/file-adapters');
const PasswordAuthStrategy = require('@voussoir/core/auth/Password');
const { port, staticRoute, staticPath, cloudinary } = require('./config');

const initialData = require('./data');

const { MongooseAdapter } = require('@voussoir/adapter-mongoose');

const keystone = new Keystone({
  name: 'Keystone Demo Blog',
  adapter: new MongooseAdapter(),
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  sortListsAlphabetically: true,
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text, isUnique: true },
    dob: {
      type: CalendarDay,
      format: 'Do MMMM YYYY',
      yearRangeFrom: 1901,
      yearRangeTo: 2019,
    },
    password: { type: Password },
    isAdmin: { type: Checkbox },
  },
  labelResolver: item => `${item.name} <${item.email}>`,
});

keystone.createList('Post', {
  fields: {
    title: { type: Text },
    author: {
      type: Relationship,
      ref: 'User',
    },
    categories: {
      type: Relationship,
      ref: 'PostCategory',
      many: true,
    },
    status: {
      type: Select,
      defaultValue: 'draft',
      options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
    },
    body: { type: Text, isMultiline: true },
    posted: { type: DateTime },
  },
  adminConfig: {
    defaultPageSize: 20,
    defaultColumns: 'name, status',
    defaultSort: 'name',
  },
});

keystone.createList('PostCategory', {
  fields: {
    name: { type: Text },
    slug: { type: Text },
  },
});

keystone.createList('Comment', {
  fields: {
    body: { type: Text, isMultiline: true },
    originalPost: {
      type: Relationship,
      ref: 'Post',
    },
    author: {
      type: Relationship,
      ref: 'User',
    },
    posted: { type: DateTime },
  },
  labelResolver: item => item.body,
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  sortListsAlphabetically: true,
});

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
  port,
  authStrategy: authStrategy,
});

// delete this so you don't accidently nuke your database
server.app.get('/reset-db', (req, res) => {
  const reset = async () => {
    Object.values(keystone.adapters).forEach(async adapter => {
      await adapter.dropDatabase();
    });
    await keystone.createItems(initialData);
    res.redirect(admin.adminPath);
  };
  reset();
});

server.app.use(nextApp.getRequestHandler());

async function start() {
  await Promise.all([keystone.connect(), nextApp.prepare()]);
  server.start();
  const users = await keystone.lists.User.adapter.findAll();
  if (!users.length) {
    Object.values(keystone.adapters).forEach(async adapter => {
      await adapter.dropDatabase();
    });
    await keystone.createItems(initialData);
  }
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
