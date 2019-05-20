require('dotenv').config();

const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const { GraphQLApp } = require('@keystone-alpha/app-graphql');
const { AdminUIApp } = require('@keystone-alpha/app-admin-ui');
const { NextApp } = require('@keystone-alpha/app-next');
const routes = require('./routes');

const { Event, Talk, User, Rsvp, Organiser, Sponsor } = require('./schema');

const MEETUP = require('./meetupConfig');
const initialiseData = require('./initialData');

const keystone = new Keystone({
  name: MEETUP.name + ' test',
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
  apps: [new GraphQLApp(), adminApp, new NextApp({ dir: 'site', nextRoutes: routes })],
};
