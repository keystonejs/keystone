import gql from 'graphql-tag';

import { arrayToObject, mapKeys, omit } from '@keystonejs/utils';

export const gqlCountQueries = lists => gql`{
  ${lists.map(list => list.countQuery()).join('\n')}
}`;

export default class List {
  constructor(config, adminMeta, views) {
    this.config = config;
    this.adminMeta = adminMeta;

    // TODO: undo this
    Object.assign(this, config);

    this.fields = config.fields.map(fieldConfig => {
      const [Controller] = adminMeta.readViews([views[fieldConfig.path].Controller]);
      return new Controller(fieldConfig, this, adminMeta, views[fieldConfig.path]);
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
      mutation update(
        $id: ID!,
        $data: ${this.gqlNames.updateInputName})
      {
        ${this.gqlNames.updateMutationName}(id: $id, data: $data) {
          id
        }
      }
    `;
    this.updateManyMutation = gql`
      mutation updateMany($data: [${this.gqlNames.updateManyInputName}])
      {
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

  static getQueryArgs = ({ filters, ...args }) => {
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
    return queryArgs.length ? `(${queryArgs.join(' ')})` : '';
  };

  getItemQuery(itemId) {
    return gql`{
      ${this.buildQuery(this.gqlNames.itemQueryName, `(where: { id: "${itemId}" })`, this.fields)}
    }`;
  }

  getQuery({ fields, filters, search, orderBy, skip, first }) {
    const queryArgs = List.getQueryArgs({ first, filters, search, skip, orderBy });
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
    return localStorage.getItem(`search:${this.config.path}`);
  }
  setPersistedSearch(value) {
    localStorage.setItem(`search:${this.config.path}`, value);
  }
}
