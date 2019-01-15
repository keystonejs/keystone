const { AdminUI } = require('@voussoir/admin-ui');
const { Keystone } = require('@voussoir/core');
const { Text } = require('@voussoir/fields');
const { WebServer } = require('@voussoir/server');
const { MongooseAdapter } = require('@voussoir/adapter-mongoose');
const Bundler = require('parcel');
const path = require('path');

const port = 3000;
const staticPath = path.join(process.cwd(), 'public');

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
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
