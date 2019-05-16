require('dotenv').config();

const meetup = require('../meetupConfig');
const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';

module.exports = {
  publicRuntimeConfig: {
    // Will be available on both server and client
    meetup,
    serverUrl,
  },
};
