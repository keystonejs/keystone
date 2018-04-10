const Field = require('../Field');

module.exports = class Select extends Field {
  constructor(path, config) {
    super(path, config);
    this.options = config.options;
    this.graphQLType = 'String';
  }
  extendAdminMeta(meta) {
    return { ...meta, options: this.options };
  }
};
