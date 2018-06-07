const inflection = require('inflection');
const { parseACL, pick } = require('@keystonejs/utils');

module.exports = class Field {
  constructor(path, config, { getListByKey, listKey, defaultAccess }) {
    this.path = path;
    this.config = config;
    this.getListByKey = getListByKey;
    this.listKey = listKey;
    this.label = config.label || inflection.humanize(path);

    const accessTypes = ['read', 'update'];

    // Merge the default and config access together
    this.acl = {
      ...pick(defaultAccess, accessTypes),
      ...parseACL(config.access, {
        accessTypes,
        listKey,
        path,
      }),
    };
  }
  addToMongooseSchema() {
    throw new Error(
      `Field type [${
        this.constructor.name
      }] does not implement addToMongooseSchema()`
    );
  }
  getGraphqlSchema() {
    if (!this.graphQLType) {
      throw new Error(
        `Field type [${this.constructor.name}] does not implement graphQLType`
      );
    }
    return `${this.path}: ${this.graphQLType}`;
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
  getGraphqlAuxiliaryTypes() {}
  getGraphqlAuxiliaryTypeResolvers() {}
  getGraphqlAuxiliaryQueries() {}
  getGraphqlAuxiliaryQueryResolvers() {}
  getGraphqlAuxiliaryMutations() {}
  getGraphqlAuxiliaryMutationResolvers() {}

  /**
   * Hooks for performing actions before / after fields are mutated.
   * For example: with a field { avatar: { type: File }}, it wants to put the
   * file on S3 in the `createFieldPreHook()`, then return asn S3 object ID as
   * the result to store in `avatar`
   *
   * @param data {Mixed} The data received from the query
   * @param item {Object} The existing version of the item
   * @param path {String} The path of the field in the item
   */
  createFieldPreHook(data) {
    return data;
  }
  /*
   * @param data {Mixed} The data as saved & read from the DB
   * @param item {Object} The existing version of the item
   * @param path {String} The path of the field in the item
   */
  createFieldPostHook() {}
  /*
   * @param data {Mixed} The data received from the query
   * @param item {Object} The existing version of the item
   * @param path {String} The path of the field in the item
   */
  updateFieldPreHook(data) {
    return data;
  }
  /*
   * @param data {Mixed} The data as saved & read from the DB
   * @param item {Object} The existing version of the item
   * @param path {String} The path of the field in the item
   */
  updateFieldPostHook() {}

  getGraphqlQueryArgs() {}
  isGraphqlQueryArg(arg) { return arg === this.path; }
  getGraphqlCreateArgs() {}
  getGraphqlUpdateArgs() {}
  getGraphqlFieldResolvers() {}
  getQueryConditions() {
    return [];
  }
  getAdminMeta() {
    return this.extendAdminMeta({
      label: this.label,
      path: this.path,
      type: this.constructor.name,
      defaultValue: this.config.defaultValue,
    });
  }
  extendAdminMeta(meta) {
    return meta;
  }
};
