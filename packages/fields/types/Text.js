const Field = require('../Field');

module.exports = class Text extends Field {
  constructor(path, config) {
    super(path, config);
    this.graphQLType = 'String';
  }
};
