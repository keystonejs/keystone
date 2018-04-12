const { fixConfigKeys, checkRequiredConfig } = require('@keystonejs/utils');

const requiredConfig = {
  name: 'You must provide a name for the project',
};

const defaultConfig = {
  brand: 'Keystone',
};

module.exports = function initConfig(config) {
  checkRequiredConfig(config, requiredConfig);
  return {
    ...defaultConfig,
    ...fixConfigKeys(config),
  };
};
