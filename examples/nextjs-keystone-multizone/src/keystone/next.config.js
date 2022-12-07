const keystoneConfig =
  require('@keystone-6/core/___internal-do-not-use-will-break-in-patch/admin-ui/next-config').config;

module.exports = {
  ...keystoneConfig,
  basePath: '/admin',
};
