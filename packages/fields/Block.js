class Block {
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

  getGqlAuxTypes() {
    return [];
  }

  // To be set by a Block if it requires special input fields (for example; if
  // it's utilising a join table)
  // Array of Keystone Field Types (most likely a `Relationship`)
  getGqlInputFields() {
    return [];
  }

  // To be set by a Block if it requires special input fields (for example; if
  // it's utilising a join table)
  // Array of Keystone Field Types (most likely a `Relationship`)
  getGqlOutputFields() {
    return [];
  }
}

module.exports = {
  Block,
};
