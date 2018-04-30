const { AdminUI } = require('@keystonejs/admin-ui');
const { Keystone } = require('@keystonejs/core');
const { Text, Select, Password } = require('@keystonejs/fields');
const { WebServer } = require('@keystonejs/server');

// TODO: Make this work again
// const SecurePassword = require('./custom-fields/SecurePassword');

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
    password: {
      type: Password,
    },
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
  adminPath: '/admin',
});

server.app.get('/reset-db', (req, res) => {
  const reset = async () => {
    await keystone.mongoose.connection.dropDatabase();
    await keystone.createItems(initialData);
    res.redirect('/admin');
  };
  reset();
});

async function start() {
  keystone.connect();
  server.start();
  const users = await keystone.lists.User.model.find();
  if (!users.length) {
    await keystone.mongoose.connection.dropDatabase();
    await keystone.createItems(initialData);
  }
}

start();
