// Keystone imports
const { Keystone } = require('@voussoir/core');
const { AdminUI } = require('@voussoir/admin-ui');
const { Text } = require('@voussoir/fields');
const { WebServer } = require('@voussoir/server');
const { MongooseAdapter } = require('@voussoir/adapter-mongoose');

// Imports for the app
const Bundler = require('parcel');
const path = require('path');
const staticPath = path.join(process.cwd(), 'public');
const bundler = new Bundler(path.join(staticPath, 'index.html'));

const keystone = new Keystone({
      name: 'Keystone To-Do List',
      adapter: new MongooseAdapter(),
});

keystone.createList('Todo', {
      fields: {
            name: { type: Text },
      },
});

const admin = new AdminUI(keystone, { adminPath: '/admin' })

const server = new WebServer(keystone, {
      'cookie secret': 'qwerty',
      'admin ui': admin,
      port: 3000,
});

server.app.use(bundler.middleware());

async function start() {
      await keystone.connect();
      server.start();
}

start().catch(error => {
      console.error(error);
      process.exit(1);
});
