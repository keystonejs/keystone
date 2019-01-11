const { AdminUI } = require('@voussoir/admin-ui');
const { Keystone } = require('@voussoir/core');
const { Text, DateTime } = require('@voussoir/fields');
const { WebServer } = require('@voussoir/server');
const Bundler = require('parcel');
const path = require('path');

const { port, staticPath } = require('./config');

const initialData = require('./data');

const { MongooseAdapter } = require('@voussoir/adapter-mongoose');

const keystone = new Keystone({
  name: 'Keystone To-Do List',
  adapter: new MongooseAdapter(),
});

keystone.createList('Todo', {
  fields: {
    name: { type: Text },
  },
  labelResolver: item => item.name,
});

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
});

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
  port,
});

const bundler = new Bundler(path.join(staticPath, 'index.html'));

server.app.use(bundler.middleware());

async function start() {
  await keystone.connect();
  server.start();
  const todos = await keystone.lists.Todo.adapter.findAll();
  if (!todos.length) {
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
