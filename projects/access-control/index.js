const { AdminUI } = require('@keystonejs/admin-ui');
const { Keystone } = require('@keystonejs/core');
const { Text, Password, Select } = require('@keystonejs/fields');
const { WebServer } = require('@keystonejs/server');
const PasswordAuthStrategy = require('@keystonejs/core/auth/Password');

const {
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  getFieldName,
  listAccessVariations,
  fieldAccessVariations,
} = require('./cypress/integration/util');

const { port, staticRoute, staticPath } = require('./config');

const initialData = require('./data');

const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const keystone = new Keystone({
  name: process.env.PROJECT_NAME,
  adapter: new MongooseAdapter(),
});

// eslint-disable-next-line no-unused-vars
const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

keystone.createList('User', {
  fields: {
    email: {
      type: Text,
      defaultValue: '',
    },
    password: {
      type: Password,
      defaultValue: '',
    },
    // Normally users might be multiple of each of these, but for demo purposes
    // we assume they can only be one at a time.
    level: {
      type: Select,
      options: ['su', 'admin', 'editor', 'writer', 'reader'],
    },
    // NOTE: We only need imperitive ones here - we test elsewhere that static
    // fields aren't included in graphQL responses. And fields can't have
    // declarative types.
    noRead: { type: Text, access: { read: () => false } },
    yesRead: { type: Text, access: { read: () => true } },
  },
});

function createListWithStaticAccess(access) {
  const createField = fieldAccess => ({
    [getFieldName(fieldAccess)]: {
      type: Text,
      access: fieldAccess,
      defaultValue: '',
    },
  });
  keystone.createList(getStaticListName(access), {
    fields: {
      foo: { type: Text, defaultValue: '' },
      zip: { type: Text, defaultValue: '' },
      ...fieldAccessVariations.reduce(
        (memo, variation) => Object.assign(memo, createField(variation)),
        {}
      ),
    },
    access,
  });
}

function createListWithImperativeAccess(access) {
  const createField = fieldAccess => ({
    [getFieldName(fieldAccess)]: {
      type: Text,
      access: {
        create: () => fieldAccess.create,
        read: () => fieldAccess.read,
        update: () => fieldAccess.update,
        delete: () => fieldAccess.delete,
      },
      defaultValue: '',
    },
  });
  keystone.createList(getImperativeListName(access), {
    fields: {
      foo: { type: Text, defaultValue: '' },
      zip: { type: Text, defaultValue: '' },
      ...fieldAccessVariations.reduce(
        (memo, variation) => Object.assign(memo, createField(variation)),
        {}
      ),
    },
    access: {
      create: () => access.create,
      read: () => access.read,
      update: () => access.update,
      delete: () => access.delete,
    },
  });
}

function createListWithDeclarativeAccess(access) {
  keystone.createList(getDeclarativeListName(access), {
    fields: {
      foo: { type: Text, defaultValue: '' },
      zip: { type: Text, defaultValue: '' },
    },
    access: {
      create: ({ authentication: { item, listKey } }) =>
        access.create &&
        listKey === 'User' &&
        ['su', 'admin'].includes(item.level),
      read: ({ authentication: { item, listKey } }) => {
        if (
          access.read &&
          listKey === 'User' &&
          ['su', 'admin'].includes(item.level)
        ) {
          return {
            // arbitrarily restrict the data to a single item (see data.js)
            foo_starts_with: 'Hello',
          };
        }
        return false;
      },
      update: ({ authentication: { item, listKey } }) => {
        if (
          access.update &&
          listKey === 'User' &&
          ['su', 'admin'].includes(item.level)
        ) {
          return {
            // arbitrarily restrict the data to a single item (see data.js)
            foo_starts_with: 'Hello',
          };
        }
        return false;
      },
      delete: ({ authentication: { item, listKey } }) => {
        if (
          access.delete &&
          listKey === 'User' &&
          ['su', 'admin'].includes(item.level)
        ) {
          return {
            // arbitrarily restrict the data to a single item (see data.js)
            foo_starts_with: 'Hello',
          };
        }
        return false;
      },
    },
  });
}

listAccessVariations.forEach(createListWithStaticAccess);
listAccessVariations.forEach(createListWithImperativeAccess);
listAccessVariations.forEach(createListWithDeclarativeAccess);

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  // allow disabling of admin auth for test environments
  authStrategy: authStrategy,
});

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
  session: true,
  port,
});

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

server.app.use(staticRoute, server.express.static(staticPath));

async function start() {
  keystone.connect();
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
