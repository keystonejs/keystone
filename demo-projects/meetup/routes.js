const routes = require('next-routes');

module.exports = routes()
  .add('forgot-password', '/forgot-password', 'forgotPassword')
  .add('change-password', '/change-password', 'changePassword')
  .add('signin')
  .add('signout')
  .add('signup')
  .add('about')
  .add('events', '/events')
  .add('event', '/event/:id', 'event');
