const { Keystone } = require('@voussoir/keystone');
const { AdminUI } = require('@voussoir/admin-ui');
const { MongooseAdapter } = require('@voussoir/adapter-mongoose');
const { Text } = require('@voussoir/fields');

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

// Setup the optional Admin UI
const admin = new AdminUI(keystone);

module.exports = {
  keystone,
  admin,
};
