const nodePath = require('path');
const Field = require('../Field');

module.exports = class Select extends Field {
  static inputPath = nodePath.resolve('./client/Field.js');
  constructor(path, config) {
    super(path, config);
    this.options = config.options;
    this.graphQLType = 'String';
  }
  extendAdminMeta(meta) {
    return { ...meta, options: this.options };
  }
};
