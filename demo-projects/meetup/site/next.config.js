const meetup = require('../meetupConfig');

module.exports = {
  publicRuntimeConfig: {
    // Will be available on both server and client
    meetup,
  },
};
