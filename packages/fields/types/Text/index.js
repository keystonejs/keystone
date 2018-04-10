const Field = require('../../Field');

module.exports = class Text extends Field {
  constructor(path, config) {
    super(path, config);
    this.graphQLType = 'String';
  }
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: String, ...mongooseOptions },
    });
  }
};
