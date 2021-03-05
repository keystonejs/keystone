require('dotenv').config();

const { Keystone } = require('@keystone-next/keystone-legacy');
const { PasswordAuthStrategy } = require('@keystone-next/auth-password-legacy');
const { MongooseAdapter } = require('@keystone-next/adapter-mongoose-legacy');
const { GraphQLApp } = require('@keystone-next/app-graphql-legacy');
const { AdminUIApp } = require('@keystone-next/app-admin-ui-legacy');
const { NextApp } = require('@keystone-next/app-next-legacy');

const {
  Event,
  Talk,
  User,
  Rsvp,
  Organiser,
  Sponsor,
  ForgottenPasswordToken,
  customSchema,
} = require('./schema');

const MEETUP = require('./meetupConfig');
const initialiseData = require('./initialData');

const keystone = new Keystone({
  adapter: new MongooseAdapter({ mongoUri: 'mongodb://localhost/meetup' }),
  onConnect: initialiseData,
});

keystone.createList('Event', Event);
keystone.createList('Rsvp', Rsvp);
keystone.createList('Talk', Talk);
keystone.createList('User', User);
keystone.createList('Organiser', Organiser);
keystone.createList('Sponsor', Sponsor);
keystone.createList('ForgottenPasswordToken', ForgottenPasswordToken);

keystone.extendGraphQLSchema(customSchema);

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
  config: { protectIdentities: process.env.NODE_ENV === 'production' },
});

const adminApp = new AdminUIApp({
  name: MEETUP.name,
  adminPath: '/admin',
  authStrategy,
  pages: [
    {
      label: 'Meetup',
      children: ['Event', 'Talk', 'Organiser', 'Sponsor'],
    },
    {
      label: 'People',
      children: ['User', 'Rsvp'],
    },
  ],
});

module.exports = {
  keystone,
  apps: [new GraphQLApp(), adminApp, new NextApp({ dir: 'site' })],
};
