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
const Bundler = require('parcel');
const path = require('path');

const initialData = require('./data');

const { MongooseAdapter } = require('@voussoir/adapter-mongoose');

const keystone = new Keystone({
      name: 'Keystone Demo Blog',
      adapter: new MongooseAdapter(),
});

const authStrategy = keystone.createAuthStrategy({
      type: PasswordAuthStrategy,
      list: 'User',
});

keystone.createList('User', {
      fields: {
            name: { type: Text },
            email: { type: Text, isUnique: true },
            dob: {
                  type: CalendarDay,
                  format: 'Do MMMM YYYY',
                  yearRangeFrom: 1901,
                  yearRangeTo: 2018,
            },
            password: { type: Password },
            isAdmin: { type: Checkbox },
      },
      labelResolver: item => `${item.name} <${item.email}>`,
});

keystone.createList('Post', {
      fields: {
            name: { type: Text },
            slug: { type: Text },
            status: {
                  type: Select,
                  defaultValue: 'draft',
                  options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
            },
            author: {
                  type: Relationship,
                  ref: 'User',
            },
            categories: {
                  type: Relationship,
                  ref: 'PostCategory',
                  many: true,
            },
            posted: { type: DateTime },
            body: { type: Text, isMultiline: true },
      },
      adminConfig: {
            defaultPageSize: 20,
            defaultColumns: 'name, status',
            defaultSort: 'name',
      },
      labelResolver: item => item.name,
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

const bundler = new Bundler(path.join(staticPath, 'index.html'));

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

server.app.use(bundler.middleware());

async function start() {
      await keystone.connect();
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
