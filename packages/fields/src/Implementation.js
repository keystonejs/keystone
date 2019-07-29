import inflection from 'inflection';
import { parseFieldAccess } from '@keystone-alpha/access-control';

class Field {
  constructor(
    path,
    { hooks = {}, isRequired, defaultValue, access, label, schemaDoc, ...config },
    { getListByKey, listKey, listAdapter, fieldAdapterClass, defaultAccess }
  ) {
    this.path = path;
    this.isPrimaryKey = path === 'id';
    this.schemaDoc = schemaDoc;
    this.config = config;
    this.isRequired = !!isRequired;
    this.defaultValue = defaultValue;
    this.hooks = hooks;
    this.getListByKey = getListByKey;
    this.listKey = listKey;
    this.label = label || inflection.humanize(inflection.underscore(path));
    this.adapter = listAdapter.newFieldAdapter(
      fieldAdapterClass,
      this.constructor.name,
      path,
      this,
      getListByKey,
      { ...config }
    );

    // Should be overwritten by types that implement a Relationship interface
    this.isRelationship = false;

    this.access = parseFieldAccess({
      listKey,
      fieldKey: path,
      defaultAccess,
      access: access,
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
   *
   * @param options Object skipAccessControl: will be true when the types
   * should include those that otherwise would be excluded due to access control
   * checks.
   */
  getGqlAuxTypes() {
    return [];
  }
  get gqlAuxFieldResolvers() {
    return {};
  }

  /**
   * @param options Object skipAccessControl: will be true when the types
   * should include those that otherwise would be excluded due to access control
   * checks.
   */
  getGqlAuxQueries() {
    return [];
  }
  get gqlAuxQueryResolvers() {
    return {};
  }

  /**
   * @param options Object skipAccessControl: will be true when the types
   * should include those that otherwise would be excluded due to access control
   * checks.
   */
  getGqlAuxMutations() {
    return [];
  }
  get gqlAuxMutationResolvers() {
    return {};
  }

  /*
   * @param {Object} data
   * @param {Object} data.resolvedData  The incoming item for the mutation with
   * relationships and defaults already resolved
   * @param {Object} data.existingItem If this is a updateX mutation, this will
   * be the existing data in the database
   * @param {Object} data.context The graphQL context object of the current
   * request
   * @param {Object} data.originalInput The raw incoming item from the mutation
   * (no relationships or defaults resolved)
   * @param {Object} data.actions
   * @param {Function} data.actions.query Perform a graphQl query
   * programatically
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
      isRequired: this.isRequired,
      defaultValue: this.getDefaultValue(),
      isPrimaryKey: this.isPrimaryKey,
    });
  }
  extendAdminMeta(meta) {
    return meta;
  }
  extendAdminViews(views) {
    return views;
  }
  getDefaultValue() {
    return this.defaultValue;
  }
}

export { Field as Implementation };
