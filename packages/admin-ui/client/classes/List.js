import gql from 'graphql-tag';

import FieldTypes from '../FIELD_TYPES';

const getCreateMutation = list => {
  const { key } = list;
  return gql`
    mutation create($data: ${key}CreateInput!) {
      ${list.createMutationName}(data: $data) {
        id
      }
    }
  `;
};

const getUpdateMutation = list => {
  return gql`
    mutation update(
      $id: String!,
      $data: ${list.key}UpdateInput)
    {
      ${list.updateMutationName}(id: $id, data: $data) {
        id
      }
    }
  `;
};

const getDeleteMutation = list => {
  return gql`
    mutation delete($id: String!) {
      ${list.deleteMutationName}(id: $id) {
        id
      }
    }
  `;
};

const getDeleteManyMutation = list => {
  return gql`
    mutation deleteMany($ids: [String!]) {
      ${list.deleteManyMutationName}(ids: $ids) {
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
    return this.fields.reduce((data, field) => {
      data[field.path] = field.getInitialData();
      return data;
    }, {});
  }
  formatCount(items) {
    const count = Array.isArray(items) ? items.length : items;
    return count === 1 ? `1 ${this.singular}` : `${count} ${this.plural}`;
  }
}
