const defaultConfig = {
  usernameField: 'email',
  passwordField: 'password',
};

module.exports = function initConfig(config) {
  return {
    ...defaultConfig,
    ...config,
  };
};
