import gql from 'graphql-tag';

import { arrayToObject, mapKeys, omit } from '@keystone-alpha/utils';

export const gqlCountQueries = lists => gql`{
  ${lists.map(list => list.countQuery()).join('\n')}
}`;

export default class List {
  config: $TSFixMe;
  adminMeta: {
    readViews: Function;
  };
  fields: $TSFixMe;
  fieldsByPath: { [index:string] : $TSFixMe };
  gqlNames: {
    createMutationName: any;
    createManyMutationName: any;
    updateMutationName: any;
    updateManyMutationName: any;
    deleteMutationName: any;
    deleteManyMutationName: any;
    createInputName: any;
    createManyInputName: any;
    updateInputName: any;
    updateManyInputName: any;
    itemQueryName: any;
    listQueryName: any;
    listQueryMetaName: any;
  };
  createMutation: $TSFixMe;
  createManyMutation: any;
  updateMutation: any;
  updateManyMutation: any;
  deleteMutation: any;
  deleteManyMutation: any;
  singular: string;
  plural: string;
  constructor(config, adminMeta, views) {
    this.config = config;
    this.adminMeta = adminMeta; 
    
    // TODO: undo this
    Object.assign(this, config);

    this.fields = config.fields
      .filter(field => !field.isPrimaryKey)
      .map(fieldConfig => {
        const [Controller] = adminMeta.readViews([views[fieldConfig.path].Controller]);
        return new Controller(fieldConfig, this, adminMeta, views[fieldConfig.path]);
      });

      this.fieldsByPath = arrayToObject(this.fields, 'path');

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
    return `
      ${queryName}${queryArgs} {
        id
        _label_
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

  getInitialItemData() {
    return mapKeys(this.fieldsByPath, field => field.getDefaultValue());
  }

  deserializeItemData(item) {
    return { 
      ...mapKeys(this.fieldsByPath, field => field.deserialize(item)),
      // Handle the special case of `_label_` (and potentially others)
      ...omit(item, Object.keys(this.fieldsByPath)),
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
