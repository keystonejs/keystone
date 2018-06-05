const { AdminUI } = require('@keystonejs/admin-ui');
const { Keystone } = require('@keystonejs/core');
const { Text, Password, Select, Relationship } = require('@keystonejs/fields');
const { WebServer } = require('@keystonejs/server');
const PasswordAuthStrategy = require('@keystonejs/core/auth/Password');

const { port, staticRoute, staticPath } = require('./config');

const initialData = require('./data');

const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');

const keystone = new Keystone({
  name: 'Cypress Test Project For Access Control',
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
    },
    password: {
      type: Password,
    },
    // Normally users might be multiple of each of these, but for demo purposes
    // we assume they can only be one at a time.
    level: {
      type: Select,
      options: ['su', 'admin', 'editor', 'writer', 'reader'],
    },
  },
});

function yesNo(truthy) {
  return truthy ? 'Yes' : 'No';
}

function createListWithStaticAccess(access) {
  const name = `${yesNo(access.create)}Create${yesNo(access.read)}Read${yesNo(
    access.update
  )}Update${yesNo(access.delete)}DeleteStaticList`;
  keystone.createList(name, {
    fields: {
      foo: { type: Text },
    },
    access,
  });
}

function createListWithDynamicAccess(access) {
  const name = `${yesNo(access.create)}Create${yesNo(access.read)}Read${yesNo(
    access.update
  )}Update${yesNo(access.delete)}DeleteDynamicList`;
  keystone.createList(name, {
    fields: {
      foo: { type: Text },
    },
    access: {
      create: () => access.create,
      read: () => access.read,
      update: () => access.update,
      delete: () => access.delete,
    },
  });
}

function createListWithDynamicAccessForAdminOnly(access) {
  const name = `${yesNo(access.create)}Create${yesNo(access.read)}Read${yesNo(
    access.update
  )}Update${yesNo(access.delete)}DeleteDynamicForAdminOnlyList`;
  keystone.createList(name, {
    fields: {
      foo: { type: Text },
    },
    access: {
      create: ({ authentication: { item, listKey } }) =>
        access.create &&
        listKey === 'User' &&
        ['su', 'admin'].includes(item.level),
      read: ({ authentication: { item, listKey } }) =>
        access.read &&
        listKey === 'User' &&
        ['su', 'admin'].includes(item.level),
      update: ({ authentication: { item, listKey } }) =>
        access.update &&
        listKey === 'User' &&
        ['su', 'admin'].includes(item.level),
      delete: ({ authentication: { item, listKey } }) =>
        access.delete &&
        listKey === 'User' &&
        ['su', 'admin'].includes(item.level),
    },
  });
}

/* Generated with:
const result = [];
const options = ['create', 'read', 'update', 'delete'];
// All possible combinations are contained in the set 0..2^n-1
for(let flags = 0; flags < Math.pow(2, options.length); flags++) {
  // Generate an object of true/false values for the particular combination
  result.push(options.reduce((memo, option, index) => ({
    ...memo,
    // Use a bit mask to see if that bit is set
    [option]: !!(flags & (1 << index)),
  }), {}));
}
*/
// prettier-ignore
const listAccessVariations = [
  { create: false, read: false, update: false, delete: false },
  { create: true,  read: false, update: false, delete: false },
  { create: false, read: true,  update: false, delete: false },
  { create: true,  read: true,  update: false, delete: false },
  { create: false, read: false, update: true,  delete: false },
  { create: true,  read: false, update: true,  delete: false },
  { create: false, read: true,  update: true,  delete: false },
  { create: true,  read: true,  update: true,  delete: false },
  { create: false, read: false, update: false, delete: true },
  { create: true,  read: false, update: false, delete: true },
  { create: false, read: true,  update: false, delete: true },
  { create: true,  read: true,  update: false, delete: true },
  { create: false, read: false, update: true,  delete: true },
  { create: true,  read: false, update: true,  delete: true },
  { create: false, read: true,  update: true,  delete: true },
  { create: true,  read: true,  update: true,  delete: true },
];

listAccessVariations.forEach(createListWithStaticAccess);
listAccessVariations.forEach(createListWithDynamicAccess);
listAccessVariations.forEach(createListWithDynamicAccessForAdminOnly);

keystone.createList('Post', {
  fields: {
    title: {
      type: Text,
      access: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
    author: {
      type: Relationship,
      ref: 'User',
      access: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
    status: {
      type: Select,
      options: ['deleted', 'draft', 'published'],
      access: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
  },
  labelResolver: item => `${item.title}`,
});

// An audit trail of actions performed
keystone.createList('Audit', {
  fields: {
    user: {
      type: Relationship,
      ref: 'User',
      access: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
    post: {
      type: Relationship,
      ref: 'Post',
      access: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
    action: {
      type: Select,
      options: ['edit', 'create', 'delete', 'changestatus'],
      access: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    },
  },
  // Only admins have access
  access: {
    create: ({ authentication: { item, listKey } }) =>
      listKey === 'User' && ['su', 'admin'].includes(item.level),
    read: ({ authentication: { item, listKey } }) =>
      listKey === 'User' && ['su', 'admin'].includes(item.level),
    update: ({ authentication: { item, listKey } }) =>
      listKey === 'User' && ['su', 'admin'].includes(item.level),
    delete: ({ authentication: { item, listKey } }) =>
      listKey === 'User' && ['su', 'admin'].includes(item.level),
  },
});

// A log of everything going on
keystone.createList('Log', {
  fields: {
    entry: { type: Text },
  },
  access: {
    create: true,
    read: false,
    update: false,
    delete: false,
  },
});

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
