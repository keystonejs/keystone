// Keystone imports
const { Keystone } = require('@voussoir/core');
const { AdminUI } = require('@voussoir/admin-ui');
const { Text } = require('@voussoir/fields');
const { WebServer } = require('@voussoir/server');
const { MongooseAdapter } = require('@voussoir/adapter-mongoose');
const express = require('express');
const path = require('path');

const keystone = new Keystone({
  name: 'Keystone To-Do List',
  adapter: new MongooseAdapter(),
});

keystone.createList('Todo', {
  fields: {
    name: { type: Text },
  },
});

const admin = new AdminUI(keystone, { adminPath: '/admin' });

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
  port: 3000,
});

server.app.use(express.static(path.join(__dirname, 'public')));

async function start() {
  await keystone.connect();
  server.start();
}

start().catch(error => {
  console.error(error);
  process.exit(1);
});
