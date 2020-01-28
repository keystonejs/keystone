import inflection from 'inflection';
import { parseFieldAccess } from '@keystonejs/access-control';

class Field {
  constructor(
    path,
    { hooks = {}, isRequired, defaultValue, access, label, schemaDoc, adminDoc, ...config },
    { getListByKey, listKey, listAdapter, fieldAdapterClass, defaultAccess, schemaNames }
  ) {
    this.path = path;
    this.isPrimaryKey = path === 'id';
    this.schemaDoc = schemaDoc;
    this.adminDoc = adminDoc;
    this.config = config;
    this.isRequired = !!isRequired;
    this.defaultValue = defaultValue;
    this.isOrderable = false;
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

    this.access = this.parseFieldAccess({
      schemaNames,
      listKey,
      fieldKey: path,
      defaultAccess,
      access,
    });
  }

  parseFieldAccess(args) {
    return parseFieldAccess(args);
  }

  // Field types should replace this if they want to any fields to the output type
  gqlOutputFields() {
    return [];
  }
  gqlOutputFieldResolvers() {
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
  getGqlAuxTypes() {
    return [];
  }
  gqlAuxFieldResolvers() {
    return {};
  }

  getGqlAuxQueries() {
    return [];
  }
  gqlAuxQueryResolvers() {
    return {};
  }

  getGqlAuxMutations() {
    return [];
  }
  gqlAuxMutationResolvers() {
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

  gqlQueryInputFields() {
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
  getAdminMeta({ schemaName }) {
    const schemaAccess = this.access[schemaName];
    return this.extendAdminMeta({
      label: this.label,
      path: this.path,
      type: this.constructor.name,
      isRequired: this.isRequired,
      isOrderable: this.isOrderable,
      // We can only pass scalar default values through to the admin ui, not
      // functions
      defaultValue: typeof this.defaultValue !== 'function' ? this.defaultValue : undefined,
      isPrimaryKey: this.isPrimaryKey,
      // NOTE: This data is serialised, so we're unable to pass through any
      // access control _functions_. But we can still check for the boolean case
      // and pass that through (we assume that if there is a function, it's a
      // "maybe" true, so default it to true).
      access: {
        create: !!schemaAccess.create,
        read: !!schemaAccess.read,
        update: !!schemaAccess.update,
      },
      adminDoc: this.adminDoc,
    });
  }
  extendAdminMeta(meta) {
    return meta;
  }
  extendAdminViews(views) {
    return views;
  }
  getDefaultValue({ existingItem, context, originalInput, actions }) {
    if (typeof this.defaultValue !== 'undefined') {
      if (typeof this.defaultValue === 'function') {
        return this.defaultValue({ existingItem, context, originalInput, actions });
      } else {
        return this.defaultValue;
      }
    }
    // By default, the default value is undefined
    return undefined;
  }
}

export { Field as Implementation };
