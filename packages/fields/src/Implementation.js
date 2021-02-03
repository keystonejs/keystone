import inflection from 'inflection';
import { parseFieldAccess } from '@keystonejs/access-control';

class Field {
  constructor(
    path,
    {
      hooks = {},
      isRequired,
      defaultValue,
      access,
      label,
      schemaDoc,
      adminDoc,
      adminConfig,
      ...config
    },
    { getListByKey, listKey, listAdapter, fieldAdapterClass, defaultAccess, schemaNames }
  ) {
    this.path = path;
    this.isPrimaryKey = path === 'id';
    this.schemaDoc = schemaDoc;
    this.adminDoc = adminDoc;
    this.adminConfig = adminConfig;
    this.config = config;
    this.isRequired = !!isRequired;
    this.defaultValue = defaultValue;
    this.isOrderable = false;
    this.hooks = hooks;
    this.getListByKey = getListByKey;
    this.listKey = listKey;
    this.label = label || inflection.humanize(inflection.underscore(path));
    if (this.config.isUnique && !this._supportsUnique) {
      throw new Error(
        `isUnique is not a supported option for field type ${this.constructor.name} (${this.path})`
      );
    }

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

  // By default we assume that fields do not support unique constraints.
  // Fields should override this method if they want to support uniqueness.
  get _supportsUnique() {
    return false;
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
   * NOTE: When a naming conflict occurs, a list's types/queries/mutations will
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

  /**
   * @param {Object} data
   * @param {Object} data.resolvedData  The incoming item for the mutation with
   * relationships and defaults already resolved
   * @param {Object} data.existingItem If this is a updateX mutation, this will
   * be the existing data in the database
   * @param {Object} data.context The graphQL context object of the current
   * request
   * @param {Object} data.originalInput The raw incoming item from the mutation
   * (no relationships or defaults resolved)
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
  gqlCreateInputFields() {
    return [];
  }
  gqlUpdateInputFields() {
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
      ...this.adminConfig,
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
  getDefaultValue({ context, originalInput }) {
    if (typeof this.defaultValue !== 'undefined') {
      if (typeof this.defaultValue === 'function') {
        return this.defaultValue({ context, originalInput });
      } else {
        return this.defaultValue;
      }
    }
    // By default, the default value is undefined
    return undefined;
  }

  getBackingTypes() {
    // Return the typescript types of the backing item for this field type.
    // This method can be helpful if you want to auto-generate typescript types.
    // Future releases of Keystone will provide full typescript support
    return { [this.path]: { optional: true, type: 'any' } };
  }
}

export { Field as Implementation };
