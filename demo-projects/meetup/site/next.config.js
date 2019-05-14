const path = require('path');
const meetup = require('../meetupConfig');

module.exports = {
  publicRuntimeConfig: {
    // Will be available on both server and client
    meetup,
  },
  webpack(config) {
    // Aliases to import stuff without relative paths
    config.resolve.alias['@root'] = path.join(__dirname, '');
    config.resolve.alias['@components'] = path.join(__dirname, 'components');
    config.resolve.alias['@primitives'] = path.join(__dirname, 'primitives');
    return config;
  },
};
