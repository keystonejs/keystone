require('dotenv').config();

const { Keystone } = require('@keystone/keystone');
const { PasswordAuthStrategy } = require('@keystone/auth-password');
const { MongooseAdapter } = require('@keystone/adapter-mongoose');
const { GraphQLApp } = require('@keystone/app-graphql');
const { AdminUIApp } = require('@keystone/app-admin-ui');
const { NextApp } = require('@keystone/app-next');

const { Event, Talk, User, Rsvp, Organiser, Sponsor, ForgottenPasswordToken } = require('./schema');

const MEETUP = require('./meetupConfig');
const initialiseData = require('./initialData');

const keystone = new Keystone({
  name: MEETUP.name,
  adapter: new MongooseAdapter(),
  onConnect: initialiseData,
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

keystone.createList('Event', Event);
keystone.createList('Rsvp', Rsvp);
keystone.createList('Talk', Talk);
keystone.createList('User', User);
keystone.createList('Organiser', Organiser);
keystone.createList('Sponsor', Sponsor);
keystone.createList('ForgottenPasswordToken', ForgottenPasswordToken);

const adminApp = new AdminUIApp({
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
