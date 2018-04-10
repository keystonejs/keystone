const { AdminUI } = require('@keystone/admin-ui');
const { Keystone } = require('@keystone/core');
const { Text, Password, Select } = require('@keystone/fields');
const { WebServer } = require('@keystone/server');

const stubData = require('./data');
const keystone = new Keystone(stubData);

keystone.createList('Users', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    company: {
      type: Select,
      options: [
        { label: 'Thinkmill', value: 'tm' },
        { label: 'Atlassian', value: 'team' },
      ],
    },
    password: { type: Password },
  },
});

keystone.createList('Posts', {
  fields: {
    name: { type: Text },
  },
});

const admin = new AdminUI(keystone);

const server = new WebServer({
  'cookie secret': 'qwerty',
  'admin ui': admin,
});

server.start();
