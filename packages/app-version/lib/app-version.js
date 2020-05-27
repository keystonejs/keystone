const { parseCustomAccess } = require('@keystonejs/access-control');

class AppVersionProvider {
  constructor({ version, access, schemaNames }) {
    this._access = parseCustomAccess({
      access: access,
      schemaNames,
      defaultAccess: true,
    });
    this._version = version;
  }

  getTypes({}) {
    return [];
  }
  getQueries({ schemaName }) {
    return this._access[schemaName]
      ? [
          `"""The version of the Keystone application serving this API."""
          appVersion: String`,
        ]
      : [];
  }
  getMutations({}) {
    return [];
  }
  getSubscriptions({}) {
    return [];
  }

  getTypeResolvers({}) {
    return {};
  }
  getQueryResolvers({ schemaName }) {
    return this._access[schemaName] ? { appVersion: () => this._version } : {};
  }
  getMutationResolvers({}) {
    return {};
  }
  getSubscriptionResolvers({}) {
    return {};
  }
}

const appVersionMiddleware = version => (req, res, next) => {
  res.set('X-Keystone-App-Version', version);
  next();
};

module.exports = { AppVersionProvider, appVersionMiddleware };
