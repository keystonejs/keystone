const Field = require('../Field');

module.exports = class Password extends Field {
  constructor(path, config) {
    super(path, config);
    this.graphQLType = 'String';
  }
};
