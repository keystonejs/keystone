// @flow
import gql from 'graphql-tag';

import type { DocumentNode } from 'graphql';

import FieldTypes from '../FIELD_TYPES';
import { arrayToObject } from '@voussoir/utils';
import type { AdminMeta } from '../providers/AdminMeta';
import type { FieldControllerType } from '@voussoir/fields/Controller';
import type { Filter } from '../pages/List/url-state';

type GQLNames = {
  [key: string]: string,
};

export const gqlCountQueries = (lists: Array<List>) => gql`{
  ${lists.map(list => list.countQuery()).join('\n')}
}`;

type Access = {
  create: boolean,
  delete: boolean,
  read: boolean,
  update: boolean,
};

type Config = {
  key: string,
  label: string,
  path: string,
  plural: string,
  singular: string,
  adminConfig: {
    defaultColumns: string,
    defaultPageSize: number,
    defaultSort: string,
    maximumPageSize: number,
  },
  fields: Array<FieldControllerType>,
  views: {
    [fieldName: string]: {
      Controller: string,
      Filter?: string,
      Cell?: string,
      Field?: string,
    },
  },
  gqlNames: GQLNames,
  access: Access,
};

export default class List {
  createMutation: DocumentNode;
  updateMutation: DocumentNode;
  deleteMutation: DocumentNode;
  deleteManyMutation: DocumentNode;
  fields: Array<*>;
  config: Config;
  // for the Object.assign(this, config)
  key: string;
  label: string;
  path: string;
  plural: string;
  singular: string;
  adminConfig: {
    defaultColumns: string,
    defaultPageSize: number,
    defaultSort: string,
    maximumPageSize: number,
  };
  gqlNames: GQLNames;
  access: Access;
  fields: Array<FieldControllerType>;
  views: {
    [fieldName: string]: {
      Controller: string,
      Filter?: string,
      Cell?: string,
      Field?: string,
    },
  };
  constructor(config: Config, adminMeta: AdminMeta) {
    this.config = config;

    // TODO: undo this
    Object.assign(this, config);

    this.fields = config.fields.map(fieldConfig => {
      const { Controller } = FieldTypes[config.key][fieldConfig.path];
      return new Controller(fieldConfig, this, adminMeta);
    });

    this.createMutation = gql`
      mutation create($data: ${this.gqlNames.createInputName}!) {
        ${this.gqlNames.createMutationName}(data: $data) {
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

  buildQuery(queryName: string, queryArgs: string = '', fields: Array<FieldControllerType> = []) {
    return `
      ${queryName}${queryArgs} {
        id
        _label_
        ${fields.map(field => field.getQueryFragment()).join(' ')}
      }`;
  }

  static getQueryArgs = ({ filters, ...args }: any) => {
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

  getItemQuery(itemId: string) {
    return gql`{
      ${this.buildQuery(this.gqlNames.itemQueryName, `(where: { id: "${itemId}" })`, this.fields)}
    }`;
  }

  getQuery({
    fields,
    filters,
    search,
    orderBy,
    skip,
    first,
  }: {
    search: string,
    fields: Array<FieldControllerType>,
    filters: Array<Filter>,
    orderBy: string,
    skip: number,
    first: number,
  }) {
    const queryArgs = List.getQueryArgs({ first, filters, search, skip, orderBy });
    const metaQueryArgs = List.getQueryArgs({ filters, search });
    const safeFields = fields.filter(field => field.path !== '_label_');
    return gql`{
      ${this.buildQuery(this.gqlNames.listQueryName, queryArgs, safeFields)}
      ${this.countQuery(metaQueryArgs)}
    }`;
  }

  getBasicQuery() {
    // TODO: How can we replace this with field.Controller.getQueryFragment()?
    return gql`{
      ${this.buildQuery(this.gqlNames.listQueryName)}
    }`;
  }

  countQuery(metaQueryArgs: string = '') {
    return `${this.gqlNames.listQueryMetaName}${metaQueryArgs} { count }`;
  }

  getInitialItemData() {
    return arrayToObject(this.fields, 'path', field => field.getInitialData());
  }
  formatCount(items: Array<*> | number) {
    const count = Array.isArray(items) ? items.length : items;
    return count === 1 ? `1 ${this.singular}` : `${count} ${this.plural}`;
  }
  getPersistedSearch() {
    return localStorage.getItem(`search:${this.config.path}`);
  }
  setPersistedSearch(value: string) {
    localStorage.setItem(`search:${this.config.path}`, value);
  }
}
