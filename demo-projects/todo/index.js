// Keystone imports
const { Keystone } = require('@voussoir/core');
const { AdminUI } = require('@voussoir/admin-ui');
const Text = require('@voussoir/field-text');
const { WebServer } = require('@voussoir/server');
const { MongooseAdapter } = require('@voussoir/adapter-mongoose');
const express = require('express');
const path = require('path');

const keystone = new Keystone({
  name: 'Keystone To-Do List',
  adapter: new MongooseAdapter(),
});

keystone.createList('Todo', {
  schemaDoc: 'A list of things which need to be done',
  fields: {
    name: { type: Text, schemaDoc: 'This is the thing you need to do' },
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
