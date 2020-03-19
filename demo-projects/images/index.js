const { Keystone } = require('@keystonejs/keystone');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { Text } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { StaticApp } = require('@keystonejs/app-static');
const { ImageService } = require('@keystonejs/images');

const imageService = new ImageService({
  mode: 'local',
  path: './images',
  port: 4008,
  transforms: {
    thumbnail: {
      fit: { width: 100, height: 100 },
      quality: 80,
    },
  },
});

const keystone = new Keystone({
  name: 'Keystone Images Demo',
  adapter: new MongooseAdapter(),
});

keystone.createList('Photo', {
  fields: {
    name: { type: Text, isRequired: true },
    // image: { type: Image, service: imageService },
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: '/', src: 'public' }),
    new AdminUIApp({ enableDefaultRoute: true }),
  ],
};
