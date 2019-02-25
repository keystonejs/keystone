module.exports = class Block {
  constructor() {
    // To be set by a Block if it creates a join table.
    // Instance of @keystone/core#List
    this.auxList = undefined;
  }

  static get isComplexDataType() {
    return false;
  }

  getGqlInputType() {
    if (!this.constructor.type) {
      throw new Error(`${this.constructor.name} must have a static 'type' property`);
    }
    return `${this.constructor.type}RelateToManyInput`;
  }
};
