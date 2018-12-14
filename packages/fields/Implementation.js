const inflection = require('inflection');
const { parseFieldAccess } = require('@voussoir/access-control');

class Field {
  constructor(
    path,
    config,
    { getListByKey, listKey, listAdapter, fieldAdapterClass, defaultAccess }
  ) {
    this.path = path;
    this.config = {
      hooks: {},
      ...config,
    };
    this.getListByKey = getListByKey;
    this.listKey = listKey;
    this.label = config.label || inflection.humanize(inflection.underscore(path));
    this.adapter = listAdapter.newFieldAdapter(
      fieldAdapterClass,
      this.constructor.name,
      path,
      getListByKey,
      config
    );

    // Should be overwritten by types that implement a Relationship interface
    this.isRelationship = false;

    this.access = parseFieldAccess({
      listKey,
      fieldKey: path,
      defaultAccess,
      access: config.access,
    });
  }

  // Field types should replace this if they want to any fields to the output type
  get gqlOutputFields() {
    return [];
  }
  get gqlOutputFieldResolvers() {
    return {};
  }

  /**
   * Auxiliary Types are top-level types which a type may need or provide.
   * Example: the `File` type, adds a graphql auxiliary type of `FileUpload`, as
   * well as an `uploadFile()` graphql auxiliary type query resolver
   *
   * These are special cases, and should be used sparingly
   *
   * NOTE: When a naming conflic occurs, a list's types/queries/mutations will
   * overwrite any auxiliary types defined by an individual type.
   */
  get gqlAuxTypes() {
    return [];
  }
  get gqlAuxFieldResolvers() {
    return {};
  }

  get gqlAuxQueries() {
    return [];
  }
  get gqlAuxQueryResolvers() {
    return {};
  }

  get gqlAuxMutations() {
    return [];
  }
  get gqlAuxMutationResolvers() {
    return {};
  }

  /*
   * @param data {Mixed} The value of this field received from the query
   * @param item {Object} The existing version of the item
   * @param context {Mixed} The GraphQL Context object for the current request
   */
  async resolveInput({ resolvedData }) {
    return resolvedData[this.path];
  }

  async validateInput() {}

  async beforeChange() {}

  async afterChange() {}

  async beforeDelete() {}

  async validateDelete() {}

  async afterDelete() {}

  get gqlQueryInputFields() {
    return [];
  }

  equalityInputFields(type) {
    return [`${this.path}: ${type}`, `${this.path}_not: ${type}`];
  }
  equalityInputFieldsInsensitive(type) {
    return [`${this.path}_i: ${type}`, `${this.path}_not_i: ${type}`];
  }
  inInputFields(type) {
    return [`${this.path}_in: [${type}]`, `${this.path}_not_in: [${type}]`];
  }
  orderingInputFields(type) {
    return [
      `${this.path}_lt: ${type}`,
      `${this.path}_lte: ${type}`,
      `${this.path}_gt: ${type}`,
      `${this.path}_gte: ${type}`,
    ];
  }
  stringInputFields(type) {
    return [
      `${this.path}_contains: ${type}`,
      `${this.path}_not_contains: ${type}`,
      `${this.path}_starts_with: ${type}`,
      `${this.path}_not_starts_with: ${type}`,
      `${this.path}_ends_with: ${type}`,
      `${this.path}_not_ends_with: ${type}`,
    ];
  }
  stringInputFieldsInsensitive(type) {
    return [
      `${this.path}_contains_i: ${type}`,
      `${this.path}_not_contains_i: ${type}`,
      `${this.path}_starts_with_i: ${type}`,
      `${this.path}_not_starts_with_i: ${type}`,
      `${this.path}_ends_with_i: ${type}`,
      `${this.path}_not_ends_with_i: ${type}`,
    ];
  }

  get gqlCreateInputFields() {
    return [];
  }
  get gqlUpdateInputFields() {
    return [];
  }

  getAdminMeta() {
    return this.extendAdminMeta({
      label: this.label,
      path: this.path,
      type: this.constructor.name,
      defaultValue: this.getDefaultValue(),
    });
  }
  extendAdminMeta(meta) {
    return meta;
  }
  getDefaultValue() {
    return this.config.defaultValue;
  }
}

module.exports = {
  Implementation: Field,
};
