const { parseCustomAccess } = require('@keystonejs/access-control');

class VersionProvider {
  constructor({ appVersion, schemaNames }) {
    appVersion.access = parseCustomAccess({
      access: appVersion.access,
      schemaNames,
      defaultAccess: true,
    });
    this._appVersion = appVersion;
  }

  getTypes({}) {
    return [];
  }
  getQueries({ schemaName }) {
    return this._appVersion.access[schemaName]
      ? [
          `"""The version of the Keystone application serving this API."""
          appVersion: String`,
        ]
      : [];
  }
  getMutations({}) {
    return [];
  }

  getTypeResolvers({}) {
    return {};
  }
  getQueryResolvers({ schemaName }) {
    return this._appVersion.access[schemaName]
      ? { appVersion: () => this._appVersion.version }
      : {};
  }
  getMutationResolvers({}) {
    return {};
  }
}

module.exports = { VersionProvider };
