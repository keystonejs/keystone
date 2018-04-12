const { AdminUI } = require('@keystonejs/admin-ui');
const { Keystone } = require('@keystonejs/core');
const { Text, Password, Select } = require('@keystonejs/fields');
const { WebServer } = require('@keystonejs/server');

const initialData = require('./data');

const keystone = new Keystone({
  name: 'Test Project',
});

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: { type: Text },
    company: {
      type: Select,
      options: [
        { label: 'Thinkmill', value: 'thinkmill' },
        { label: 'Atlassian', value: 'atlassian' },
      ],
    },
    password: { type: Password },
  },
});

keystone.createList('Post', {
  fields: {
    name: { type: Text },
  },
});

const admin = new AdminUI(keystone);

const server = new WebServer(keystone, {
  'cookie secret': 'qwerty',
  'admin ui': admin,
});

async function start() {
  keystone.connect();
  server.start();
  const users = await keystone.lists.User.model.find();
  if (!users.length || process.env.RESET_DB) {
    await keystone.mongoose.connection.dropDatabase();
    await keystone.createItems(initialData);
  }
}

start();
