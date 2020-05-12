import gql from 'graphql-tag';

import { arrayToObject, mapKeys, omit } from '@keystonejs/utils';

export const gqlCountQueries = lists => gql`{
  ${lists.map(list => list.countQuery()).join('\n')}
}`;

export default class List {
  constructor(
    { access, adminConfig, adminDoc, fields, gqlNames, key, label, path, plural, singular },
    { readViews, preloadViews, getListByKey, adminPath, authStrategy },
    views
  ) {
    this.access = access;
    this.adminConfig = adminConfig;
    this.adminDoc = adminDoc;
    this.gqlNames = gqlNames;
    this.key = key;
    this.label = label;
    this.path = path;
    this.plural = plural;
    this.singular = singular;
    this.fullPath = `${adminPath}/${path}`;

    this.fields = fields.map(fieldConfig => {
      const [Controller] = readViews([views[fieldConfig.path].Controller]);
      return new Controller(
        fieldConfig,
        { readViews, preloadViews, getListByKey, adminPath, authStrategy },
        views[fieldConfig.path]
      );
    });

    this._fieldsByPath = arrayToObject(this.fields, 'path');

    this.createMutation = gql`
      mutation create($data: ${this.gqlNames.createInputName}!) {
        ${this.gqlNames.createMutationName}(data: $data) {
          id
          _label_
        }
      }
    `;

    this.createManyMutation = gql`
      mutation createMany($data: ${this.gqlNames.createManyInputName}!) {
        ${this.gqlNames.createManyMutationName}(data: $data) {
          id
        }
      }
    `;

    this.updateMutation = gql`
      mutation update($id: ID!, $data: ${this.gqlNames.updateInputName}) {
        ${this.gqlNames.updateMutationName}(id: $id, data: $data) {
          id
        }
      }
    `;

    this.updateManyMutation = gql`
      mutation updateMany($data: [${this.gqlNames.updateManyInputName}]) {
        ${this.gqlNames.updateManyMutationName}(data: $data) {
          id
        }
      }
    `;

    this.deleteMutation = gql`
      mutation delete($id: ID!) {
        ${this.gqlNames.deleteMutationName}(id: $id) {
          id
        }
      }
    `;

    this.deleteManyMutation = gql`
      mutation deleteMany($ids: [ID!]) {
        ${this.gqlNames.deleteManyMutationName}(ids: $ids) {
          id
        }
      }
    `;
  }

  buildQuery(queryName, queryArgs = '', fields = []) {
    let requiredFields = ['id', '_label_'];
    return `
      ${queryName}${queryArgs} {
        ${requiredFields
          .filter(requiredField => !fields.find(({ path }) => path === requiredField))
          .join(' ')}
        ${fields.map(field => field.getQueryFragment()).join(' ')}
      }`;
  }

  static getQueryArgs = ({ filters, sortBy, ...args }) => {
    const queryArgs = Object.keys(args).map(
      // Using stringify to get the correct quotes depending on type
      argName => `${argName}: ${JSON.stringify(args[argName])}`
    );
    if (filters) {
      const filterArgs = filters.map(filter => filter.field.getFilterGraphQL(filter));
      if (filterArgs.length) {
        queryArgs.push(`where: { ${filterArgs.join(', ')} }`);
      }
    }
    if (sortBy) {
      queryArgs.push(`sortBy: ${sortBy.field.path}_${sortBy.direction}`);
    }
    return queryArgs.length ? `(${queryArgs.join(' ')})` : '';
  };

  getItemQuery(itemId) {
    return gql`{
      ${this.buildQuery(this.gqlNames.itemQueryName, `(where: { id: "${itemId}" })`, this.fields)}
    }`;
  }

  getQuery(args) {
    const { fields, filters, search, sortBy, skip, first } = args;
    const sanatisedQueryArgs = Object.keys({ first, filters, search, skip, sortBy })
      .filter(key => args[key])
      .reduce((acc, key) => ({ ...acc, [key]: args[key] }), {});
    const queryArgs = List.getQueryArgs(sanatisedQueryArgs);
    const metaQueryArgs = List.getQueryArgs({ filters, search });
    const safeFields = fields.filter(field => field.path !== '_label_');
    return gql`{
      ${this.buildQuery(this.gqlNames.listQueryName, queryArgs, safeFields)}
      ${this.countQuery(metaQueryArgs)}
    }`;
  }

  countQuery(metaQueryArgs = '') {
    return `${this.gqlNames.listQueryMetaName}${metaQueryArgs} { count }`;
  }

  getInitialItemData({ originalInput = {}, prefill = {} } = {}) {
    return this.fields
      .filter(({ isPrimaryKey }) => !isPrimaryKey)
      .reduce(
        (memo, field) => ({
          ...memo,
          [field.path]: field.getDefaultValue({ originalInput, prefill }),
        }),
        {}
      );
  }

  deserializeItemData(item) {
    return {
      ...mapKeys(this._fieldsByPath, field => field.deserialize(item)),
      // Handle the special case of `_label_` (and potentially others)
      ...omit(item, Object.keys(this._fieldsByPath)),
    };
  }

  formatCount(items) {
    const count = Array.isArray(items) ? items.length : items;
    return count === 1 ? `1 ${this.singular}` : `${count} ${this.plural}`;
  }

  getPersistedSearch() {
    return localStorage.getItem(`search:${this.path}`);
  }

  setPersistedSearch(value) {
    localStorage.setItem(`search:${this.path}`, value);
  }
}
