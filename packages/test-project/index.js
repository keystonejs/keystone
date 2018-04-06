const { AdminUI } = require('@keystone/admin-ui');
const { Keystone } = require('@keystone/core');
const { Name, Email, Password } = require('@keystone/fields');
const { WebServer } = require('@keystone/server');

const keystone = new Keystone();

const User = keystone.createList('User', {
  formatName: item => item.fields.name.format(),
  fields: {
    name: { type: Name },
    email: { type: Email },
    password: { type: Password },
  },
});

const admin = new AdminUI(keystone);

const server = new WebServer({
  'cookie secret': 'qwerty',
  'admin ui': admin,
});

server.start();
