import { humanize } from '@keystone-next/utils-legacy';
import { parseFieldAccess } from '@keystone-next/access-control-legacy';
import { BaseKeystoneList, KeystoneContext } from '@keystone-next/types';
import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';

export type FieldConfigArgs = {
  hooks?: any;
  isRequired?: boolean;
  defaultValue?: any;
  access?: any;
  label?: string;
  schemaDoc?: string;
  isUnique?: boolean;
};

export type FieldExtraArgs = {
  getListByKey: (key: string) => BaseKeystoneList | undefined;
  listKey: string;
  listAdapter: PrismaListAdapter;
  fieldAdapterClass: typeof PrismaFieldAdapter;
  schemaNames: string[];
};

class Field<P extends string> {
  path: P;
  isPrimaryKey: boolean;
  schemaDoc?: string;
  config: {
    isUnique?: boolean;
  };
  isRequired: boolean;
  defaultValue?: any;
  isOrderable: boolean;
  hooks: any;
  getListByKey: (key: string) => BaseKeystoneList | undefined;
  listKey: string;
  label: string;
  adapter: PrismaFieldAdapter<P>;
  isRelationship: boolean;
  access: any;
  refListKey: string;

  constructor(
    path: P,
    {
      hooks = {},
      isRequired,
      defaultValue,
      access,
      label,
      schemaDoc,
      ...config
    }: FieldConfigArgs & Record<string, any>,
    { getListByKey, listKey, listAdapter, fieldAdapterClass, schemaNames }: FieldExtraArgs
  ) {
    this.path = path;
    this.isPrimaryKey = path === 'id';
    this.schemaDoc = schemaDoc;
    this.config = config;
    this.isRequired = !!isRequired;
    this.defaultValue = defaultValue;
    this.isOrderable = false;
    this.hooks = hooks;
    this.getListByKey = getListByKey;
    this.listKey = listKey;
    this.label = label || humanize(path);

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
    this.refListKey = '';

    this.access = this._modifyAccess(
      parseFieldAccess({ schemaNames, listKey, fieldKey: path, defaultAccess: true, access })
    );
  }

  // By default we assume that fields do not support unique constraints.
  // Fields should override this method if they want to support uniqueness.
  get _supportsUnique() {
    return false;
  }

  _modifyAccess(access: any) {
    return access;
  }

  // Field types should replace this if they want to any fields to the output type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gqlOutputFields({ schemaName }: { schemaName: string }): string[] {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gqlOutputFieldResolvers({ schemaName }: { schemaName: string }) {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getGqlAuxTypes({ schemaName }: { schemaName: string }): string[] {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gqlAuxFieldResolvers({ schemaName }: { schemaName: string }) {
    return {};
  }

  getGqlAuxQueries() {
    return [];
  }
  gqlAuxQueryResolvers() {
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
  async resolveInput({ resolvedData }: { resolvedData: Record<P, any> }): Promise<any> {
    return resolvedData[this.path];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validateInput(args: any) {}

  async beforeChange() {}

  async afterChange() {}

  async beforeDelete() {}

  async validateDelete() {}

  async afterDelete() {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gqlQueryInputFields({ schemaName }: { schemaName: string }): string[] {
    return [];
  }
  equalityInputFields(type: string) {
    return [`${this.path}: ${type}`, `${this.path}_not: ${type}`];
  }
  equalityInputFieldsInsensitive(type: string) {
    return [`${this.path}_i: ${type}`, `${this.path}_not_i: ${type}`];
  }
  inInputFields(type: string) {
    return [`${this.path}_in: [${type}]`, `${this.path}_not_in: [${type}]`];
  }
  orderingInputFields(type: string) {
    return [
      `${this.path}_lt: ${type}`,
      `${this.path}_lte: ${type}`,
      `${this.path}_gt: ${type}`,
      `${this.path}_gte: ${type}`,
    ];
  }
  containsInputFields(type: string) {
    return [`${this.path}_contains: ${type}`, `${this.path}_not_contains: ${type}`];
  }
  stringInputFields(type: string) {
    return [
      ...this.containsInputFields(type),
      `${this.path}_starts_with: ${type}`,
      `${this.path}_not_starts_with: ${type}`,
      `${this.path}_ends_with: ${type}`,
      `${this.path}_not_ends_with: ${type}`,
    ];
  }
  stringInputFieldsInsensitive(type: string) {
    return [
      `${this.path}_contains_i: ${type}`,
      `${this.path}_not_contains_i: ${type}`,
      `${this.path}_starts_with_i: ${type}`,
      `${this.path}_not_starts_with_i: ${type}`,
      `${this.path}_ends_with_i: ${type}`,
      `${this.path}_not_ends_with_i: ${type}`,
    ];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gqlCreateInputFields({ schemaName }: { schemaName: string }): string[] {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gqlUpdateInputFields({ schemaName }: { schemaName: string }): string[] {
    return [];
  }
  getDefaultValue({ context, originalInput }: { context: KeystoneContext; originalInput: any }) {
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
