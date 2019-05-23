const routes = require('next-routes');

module.exports = routes()
  .add('forgot-password', 'forgotPassword', '/forgot-password')
  .add('change-password', 'changePassword', '/change-password')
  .add('signin')
  .add('signout')
  .add('signup')
  .add('about')
  .add('events', '/events')
  .add('event', '/event/:id', 'event');
