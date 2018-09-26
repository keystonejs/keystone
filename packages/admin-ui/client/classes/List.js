import gql from 'graphql-tag';

import FieldTypes from '../FIELD_TYPES';
import { arrayToObject } from '@voussoir/utils';

const getCreateMutation = list => {
  const { createInputName } = list.gqlNames;
  return gql`
    mutation create($data: ${createInputName}!) {
      ${list.gqlNames.createMutationName}(data: $data) {
        id
      }
    }
  `;
};

const getUpdateMutation = list => {
  return gql`
    mutation update(
      $id: ID!,
      $data: ${list.gqlNames.updateInputName})
    {
      ${list.gqlNames.updateMutationName}(id: $id, data: $data) {
        id
      }
    }
  `;
};

const getDeleteMutation = list => {
  return gql`
    mutation delete($id: ID!) {
      ${list.gqlNames.deleteMutationName}(id: $id) {
        id
      }
    }
  `;
};

const getDeleteManyMutation = list => {
  return gql`
    mutation deleteMany($ids: [ID!]) {
      ${list.gqlNames.deleteManyMutationName}(ids: $ids) {
        id
      }
    }
  `;
};

export default class List {
  constructor(config, adminMeta) {
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
