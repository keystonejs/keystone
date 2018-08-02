const pluralize = require('pluralize');
const { resolveAllKeys } = require('@keystonejs/utils');

const upcase = str => str.substr(0, 1).toUpperCase() + str.substr(1);

const keyToLabel = str =>
  str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s|_|\-/)
    .filter(i => i)
    .map(upcase)
    .join(' ');

const labelToPath = str =>
  str
    .split(' ')
    .join('-')
    .toLowerCase();

const labelToClass = str => str.replace(/\s+/g, '');

const isNativeType = type => [Boolean, String, Number].includes(type);

const throwNativeTypeError = (type, listKey, fieldPath) => {
  switch (type) {
    case Boolean:
      throw new Error(
        `Field '${fieldPath}' on list '${listKey}' is set to type Boolean, a native JavaScript type. Instead, try 'Checkbox' from the @keystonejs/fields package.`
      );
    case String:
      throw new Error(
        `Field '${fieldPath}' on list '${listKey}' is set to type String, a native JavaScript type. Instead, try 'Text' from the @keystonejs/fields package.`
      );
    case Number:
      throw new Error(
        `Field '${fieldPath}' on list '${listKey}' is set to type Number, a native JavaScript type. Instead, try 'Integer', or 'Float' from the @keystonejs/fields package.`
      );
  }
};

module.exports = class List {
  constructor(key, config, { getListByKey, adapter }) {
    this.key = key;

    this.config = {
      labelResolver: item => item[config.labelField || 'name'] || item.id,
      ...config,
    };
    this.getListByKey = getListByKey;

    const label = keyToLabel(key);
    const singular = pluralize.singular(label);
    const plural = pluralize.plural(label);

    if (plural === label) {
      throw new Error(
        `Unable to use ${label} as a List name - it has an ambiguous plural (${plural}). Please choose another name for your list.`
      );
    }

    this.label = config.label || plural;
    this.singular = config.singular || singular;
    this.plural = config.plural || plural;
    this.path = config.path || labelToPath(plural);

    const itemQueryName = config.itemQueryName || labelToClass(singular);
    const listQueryName = config.listQueryName || labelToClass(plural);

    this.itemQueryName = itemQueryName;
    this.listQueryName = `all${listQueryName}`;
    this.listQueryMetaName = `_${this.listQueryName}Meta`;
    this.deleteMutationName = `delete${itemQueryName}`;
    this.deleteManyMutationName = `delete${listQueryName}`;
    this.updateMutationName = `update${itemQueryName}`;
    this.createMutationName = `create${itemQueryName}`;

    this.adapter = adapter.newListAdapter(this.key, this.config);

    this.fields = config.fields
      ? Object.keys(config.fields).map(path => {
          const { type, ...fieldSpec } = config.fields[path];

          if (isNativeType(type)) {
            throwNativeTypeError(type, key, path);
          }

          const implementation = type.implementation;
          return new implementation(path, fieldSpec, {
            getListByKey,
            listKey: key,
            listAdapter: this.adapter,
            fieldAdapterClass: type.adapters[adapter.name],
          });
        })
      : [];

    this.adapter.prepareModel();

    this.views = {};
    Object.entries(config.fields).forEach(([path, fieldConfig]) => {
      const fieldType = fieldConfig.type;
      this.views[path] = {};

      Object.entries(fieldType.views).forEach(
        ([fieldViewType, fieldViewPath]) => {
          this.views[path][fieldViewType] = fieldViewPath;
        }
      );
    });
  }
  getAdminMeta() {
    return {
      key: this.key,
      label: this.label,
      singular: this.singular,
      plural: this.plural,
      path: this.path,
      listQueryName: this.listQueryName,
      listQueryMetaName: this.listQueryMetaName,
      itemQueryName: this.itemQueryName,
      createMutationName: this.createMutationName,
      updateMutationName: this.updateMutationName,
      deleteMutationName: this.deleteMutationName,
      deleteManyMutationName: this.deleteManyMutationName,
      fields: this.fields.map(i => i.getAdminMeta()),
      views: this.views,
    };
  }
  getAdminGraphqlTypes() {
    const fieldSchemas = this.fields
      .map(i => i.getGraphqlSchema())
      .join('\n        ');

    const fieldTypes = this.fields
      .map(i => i.getGraphqlAuxiliaryTypes())
      .filter(i => i);

    const updateArgs = this.fields
      .map(i => i.getGraphqlUpdateArgs())
      .filter(i => i)
      .map(i => i.split(/\n\s+/g).join('\n        '))
      .join('\n        ')
      .trim();

    const createArgs = this.fields
      .map(i => i.getGraphqlCreateArgs())
      .filter(i => i)
      .map(i => i.split(/\n\s+/g).join('\n        '))
      .join('\n        ')
      .trim();

    const queryArgs = this.fields
      .map(field => {
        const fieldQueryArgs = field
          .getGraphqlQueryArgs()
          .split(/\n\s+/g)
          .join('\n        ');

        if (!fieldQueryArgs) {
          return null;
        }

        return `# ${field.constructor.name} field\n        ${fieldQueryArgs}`;
      })
      .filter(Boolean)
      .join('\n\n        ');

    return [
      `
      type ${this.key} {
        id: String
        # This virtual field will be resolved in one of the following ways (in this order):
        # 1. Execution of 'labelResolver' set on the ${this.key} List config, or
        # 2. As an alias to the field set on 'labelField' in the ${
          this.key
        } List config, or
        # 3. As an alias to a 'name' field on the ${
          this.key
        } List (if one exists), or
        # 4. As an alias to the 'id' field on the ${this.key} List.
        _label_: String
        ${fieldSchemas}
      }
      `,
      // TODO: AND / OR filters:
      // https://github.com/opencrud/opencrud/blob/master/spec/2-relational/2-2-queries/2-2-3-filters.md#boolean-expressions
      `
      input ${this.itemQueryName}WhereInput {
        id: ID
        id_not: ID
        id_in: [ID!]
        id_not_in: [ID!]
        ${queryArgs}
      }
      `,
      `
      input ${this.itemQueryName}WhereUniqueInput {
        id: ID!
      }
      `,
      `
      input ${this.key}UpdateInput {
        ${updateArgs}
      }
      `,
      `
      input ${this.key}CreateInput {
        ${createArgs}
      }
      `,
      ...fieldTypes,
    ];
  }
  getAdminGraphqlQueries() {
    const commonArgs = `
          search: String
          orderBy: String

          # Pagination
          first: Int
          skip: Int`;

    return [
      `
        ${this.listQueryName}(
          where: ${this.itemQueryName}WhereInput

          ${commonArgs.trim()}
        ): [${this.key}]

        ${this.itemQueryName}(where: ${this.itemQueryName}WhereUniqueInput!): ${
        this.key
      }

        ${this.listQueryMetaName}(
          where: ${this.itemQueryName}WhereInput

          ${commonArgs.trim()}
        ): _QueryMeta
      `,
      ...this.fields
        .map(field => field.getGraphqlAuxiliaryQueries())
        .filter(Boolean),
    ];
  }
  getAdminQueryResolvers() {
    return {
      [this.listQueryName]: (_, args) => this.adapter.itemsQuery(args),
      [this.listQueryMetaName]: (_, args) => this.adapter.itemsQueryMeta(args),
      [this.itemQueryName]: (_, { where: { id } }) => this.adapter.findById(id),
    };
  }
  getAdminFieldResolvers() {
    const fieldResolvers = this.fields.reduce(
      (resolvers, field) => ({
        ...resolvers,
        ...field.getGraphqlFieldResolvers(),
      }),
      {
        _label_: this.config.labelResolver,
      }
    );
    return { [this.key]: fieldResolvers };
  }
  getAuxiliaryTypeResolvers() {
    return this.fields.reduce(
      (resolvers, field) => ({
        ...resolvers,
        ...field.getGraphqlAuxiliaryTypeResolvers(),
      }),
      {}
    );
  }
  getAuxiliaryQueryResolvers() {
    return this.fields.reduce(
      (resolvers, field) => ({
        ...resolvers,
        ...field.getGraphqlAuxiliaryQueryResolvers(),
      }),
      {}
    );
  }
  getAuxiliaryMutationResolvers() {
    return this.fields.reduce(
      (resolvers, field) => ({
        ...resolvers,
        ...field.getGraphqlAuxiliaryMutationResolvers(),
      }),
      {}
    );
  }
  getAdminGraphqlMutations() {
    return [
      `
        ${this.createMutationName}(
          data: ${this.key}UpdateInput
        ): ${this.key}
        ${this.updateMutationName}(
          id: String!
          data: ${this.key}UpdateInput
        ): ${this.key}
        ${this.deleteMutationName}(
          id: String!
        ): ${this.key}
        ${this.deleteManyMutationName}(
          ids: [String!]
        ): ${this.key}
      `,
      ...this.fields
        .map(field => field.getGraphqlAuxiliaryMutations())
        .filter(Boolean),
    ];
  }
  getAdminMutationResolvers() {
    return {
      [this.createMutationName]: async (_, { data }) => {
        const resolvedData = await resolveAllKeys(
          this.fields.reduce(
            (resolvers, field) => ({
              ...resolvers,
              [field.path]: field.createFieldPreHook(
                data[field.path],
                field.path
              ),
            }),
            {}
          )
        );

        const newItem = await this.adapter.create(resolvedData);

        await Promise.all(
          this.fields.map(field =>
            field.createFieldPostHook(newItem[field.path], field.path, newItem)
          )
        );

        return newItem;
      },
      [this.updateMutationName]: async (_, { id, data }) => {
        const item = await this.adapter.findById(id);

        const resolvedData = await resolveAllKeys(
          this.fields.reduce(
            (resolvers, field) => ({
              ...resolvers,
              [field.path]: field.updateFieldPreHook(
                data[field.path],
                field.path,
                item
              ),
            }),
            {}
          )
        );

        item.set(resolvedData);
        const newItem = await item.save();

        await Promise.all(
          this.fields.map(field =>
            field.updateFieldPostHook(newItem[field.path], field.path, newItem)
          )
        );

        return newItem;
      },
      [this.deleteMutationName]: (_, { id }) => this.adapter.delete(id),
      [this.deleteManyMutationName]: async (_, { ids }) => {
        ids.map(async id => await this.adapter.delete(id));
      },
    };
  }
};
