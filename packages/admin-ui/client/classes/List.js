// @flow
import gql from 'graphql-tag';

import type { DocumentNode } from 'graphql';

import FieldTypes from '../FIELD_TYPES';
import { arrayToObject } from '@voussoir/utils';
import type { AdminMeta } from '../providers/AdminMeta';
import type { FieldControllerType } from '@voussoir/fields/Controller';

type GQLNames = {
  [key: string]: string,
};

const getCreateMutation = (gqlNames: GQLNames) => {
  return gql`
    mutation create($data: ${gqlNames.createInputName}!) {
      ${gqlNames.createMutationName}(data: $data) {
        id
      }
    }
  `;
};

const getUpdateMutation = (gqlNames: GQLNames) => {
  return gql`
    mutation update(
      $id: ID!,
      $data: ${gqlNames.updateInputName})
    {
      ${gqlNames.updateMutationName}(id: $id, data: $data) {
        id
      }
    }
  `;
};

const getDeleteMutation = (gqlNames: GQLNames) => {
  return gql`
    mutation delete($id: ID!) {
      ${gqlNames.deleteMutationName}(id: $id) {
        id
      }
    }
  `;
};

const getDeleteManyMutation = (gqlNames: GQLNames) => {
  return gql`
    mutation deleteMany($ids: [ID!]) {
      ${gqlNames.deleteManyMutationName}(ids: $ids) {
        id
      }
    }
  `;
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

    this.createMutation = getCreateMutation(this);
    this.updateMutation = getUpdateMutation(this);
    this.deleteMutation = getDeleteMutation(this);
    this.deleteManyMutation = getDeleteManyMutation(this);
  }
  getInitialItemData() {
    return arrayToObject(this.fields, 'path', field => field.getInitialData());
  }
  formatCount(items: *) {
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
