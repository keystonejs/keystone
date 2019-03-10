const { fixConfigKeys, checkRequiredConfig } = require('@keystone-alpha/utils');

const requiredConfig = [];

const defaultConfig = {
  port: process.env.PORT || 3000,
  apiPath: '/admin/api',
  graphiqlPath: '/admin/graphiql',
  apollo: undefined,
  cors: { origin: true, credentials: true },
};

const remapKeys = {
  'admin ui': 'adminUI',
};

module.exports = function initConfig(config) {
  checkRequiredConfig(config, requiredConfig);
  return {
    ...defaultConfig,
    ...fixConfigKeys(config, remapKeys),
  };
};
