//imports for Keystone app core
const { AdminUI } = require('@keystone-alpha/admin-ui');
const { Keystone, PasswordAuthStrategy } = require('@keystone-alpha/keystone');
const { MongooseAdapter } = require('@keystone-alpha/adapter-mongoose');

const { Event, Talk, User, Rsvp } = require('./schema');

const keystone = new Keystone({
  name: 'Keystone Meetup',
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

const admin = new AdminUI(keystone, {
  adminPath: '/admin',
  authStrategy,
  pages: [
    {
      label: 'Meetup',
      children: ['Event', 'Talk'],
    },
    {
      label: 'People',
      children: ['User'],
    },
  ],
});

module.exports = {
  keystone,
  admin,
};
