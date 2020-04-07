const { unique } = require('@keystonejs/utils');

class KeystoneMetaProvider {
  constructor({ metaPrefix = 'ks', name } = {}) {
    this.name = name;
    this.gqlNames = {
      ksMetaQuery: `_${metaPrefix}Meta`,
    };
  }

  getTypes() {
    return unique([
      `
      type _Meta {
        """ The name of your Keystone project. """
        projectName: String
      }`,
    ]);
  }

  getQueries() {
    return unique([
      `
      """ Retrieves metadata about the Keystone instance. """
      ${this.gqlNames.ksMetaQuery}: _Meta
      `,
    ]);
  }

  getMutations() {
    return [];
  }

  getTypeResolvers() {
    return {};
  }

  getQueryResolvers() {
    return {
      [this.gqlNames.ksMetaQuery]: () => ({ projectName: this.name }),
    };
  }

  getMutationResolvers() {
    return {};
  }
}

module.exports = { KeystoneMetaProvider };
