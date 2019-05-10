//imports for Keystone app core
const { AdminUI } = require('@keystone-alpha/admin-ui');
const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');
const NextServer = require('@keystone-alpha/server-next');
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
  servers: [admin, new NextServer({ dir: 'site', nextRoutes: routes })],
};
