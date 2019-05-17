//imports for Keystone app core
const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const GraphQLApi = require('@keystone-alpha/app-graphql');
const AdminUI = require('@keystone-alpha/app-admin');
const NextApp = require('@keystone-alpha/app-next');
const routes = require('./routes');

const { Event, Talk, User, Rsvp, Organiser, Sponsor } = require('./schema');

const MEETUP = require('./meetupConfig');

const keystone = new Keystone({
  name: MEETUP.name,
  adapter: new MongooseAdapter(),
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

const admin = new AdminUI(keystone, {
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
  disableDefaultRoute: true,
});

module.exports = {
  keystone,
  apps: [new GraphQLApi(), admin, new NextApp({ dir: 'site', nextRoutes: routes })],
};
