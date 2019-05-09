const routes = require('next-routes');

module.exports = routes()
.add('signin')
.add('about')
.add('events', '/events')
.add('event', '/event/:id', 'event');