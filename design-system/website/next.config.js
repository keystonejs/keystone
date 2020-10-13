module.exports = {
  webpack(config, { isServer, defaultLoaders }) {
    let hasFoundRule = false;
    defaultLoaders.babel.options.rootMode = 'upward-optional';
    config.module.rules.forEach(rule => {
      if (
        rule.use === defaultLoaders.babel ||
        (Array.isArray(rule.use) && rule.use.includes(defaultLoaders.babel))
      ) {
        hasFoundRule = true;
        delete rule.include;
      }
    });
    if (!hasFoundRule) {
      throw new Error('The Next Babel loader could not be found');
    }
    if (isServer) {
      config.externals = ['react', 'react-dom', 'next/router'];
      config.resolve.mainFields = ['browser', 'module', 'main'];
    } else {
      config.resolve.mainFields = ['module', 'main'];
    }

    return config;
  },
};
