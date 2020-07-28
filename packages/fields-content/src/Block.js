export class Block {
  constructor() {
    // To be set by a Block if it creates a join table.
    // Instance of @keystonejs/core#List
    this.auxList = undefined;
  }

  get type() {
    throw new Error(`${this.constructor.name} must have a 'type' getter`);
  }

  get path() {
    throw new Error(`${this.constructor.name} must have a 'path' getter`);
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

  getFieldDefinitions() {
    return {};
  }

  /**
   * @param graphQlArgs {Object}
   */
  getMutationOperationResults() {
    return;
  }

  getAdminViews() {
    return [];
  }

  getViewOptions() {
    return {};
  }
}
