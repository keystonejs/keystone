const { AdminUI } = require('@keystone/admin-ui');
const { Keystone } = require('@keystone/core');
const { Text, Password, Select } = require('@keystone/fields');
const { WebServer } = require('@keystone/server');

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
        { label: 'Thinkmill', value: 'tm' },
        { label: 'Atlassian', value: 'team' },
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
