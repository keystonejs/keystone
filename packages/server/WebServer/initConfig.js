const { fixConfigKeys, checkRequiredConfig } = require('@keystonejs/utils');

const requiredConfig = {
  'cookie secret': 'You must provide a unique cookie secret to enable sessions',
};

const defaultConfig = {
  adminPath: '/admin',
  port: 3000,
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
