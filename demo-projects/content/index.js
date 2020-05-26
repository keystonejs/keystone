const { Keystone } = require('@keystonejs/keystone');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { Text } = require('@keystonejs/fields');
const { DocumentField } = require('@keystonejs/fields-document');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
// const { StaticApp } = require('@keystonejs/app-static');

const keystone = new Keystone({
  name: 'Keystone Content Management',
  adapter: new MongooseAdapter(),
});

keystone.createList('Post', {
  fields: {
    name: { type: Text, isRequired: true },
    content: { type: DocumentField },
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    // new StaticApp({ path: '/', src: 'public' }),
    new AdminUIApp({ enableDefaultRoute: true }),
  ],
};
