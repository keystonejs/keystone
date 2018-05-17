const inflection = require('inflection');

module.exports = class Field {
  constructor(path, config, { getListByKey, listKey }) {
    this.path = path;
    this.config = config;
    this.getListByKey = getListByKey;
    this.listKey = listKey;
    this.label = config.label || inflection.humanize(path);
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
   */
  createFieldPreHook(data) { return data; }
  createFieldPostHook() {}
  updateFieldPreHook(data) { return data; }
  updateFieldPostHook() {}

  getGraphqlQueryArgs() {}
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
