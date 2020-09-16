import { gql } from '@apollo/client';

import { arrayToObject, mapKeys, omit } from '@keystonejs/utils';

export default class List {
  constructor(
    { access, adminConfig, adminDoc, fields, gqlNames, key, label, path, plural, singular },
    { readViews, preloadViews, getListByKey, adminPath },
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
        { readViews, preloadViews, getListByKey },
        views[fieldConfig.path]
      );
    });

    this._fieldsByPath = arrayToObject(this.fields, 'path');

    const {
      itemQueryName,
      createInputName,
      createMutationName,
      createManyInputName,
      createManyMutationName,
      updateInputName,
      updateMutationName,
      updateManyInputName,
      updateManyMutationName,
      deleteMutationName,
      deleteManyMutationName,
    } = this.gqlNames;

    this.itemQuery = gql`
      query getItem($id: ID!) {
        ${itemQueryName}(where: { id: $id }) {
          _label_
          ${this.fields.map(field => field.getQueryFragment()).join('\n')}
        }
      }
    `;

    this.createMutation = gql`
      mutation create($data: ${createInputName}!) {
        ${createMutationName}(data: $data) {
          id
          _label_
        }
      }
    `;

    this.createManyMutation = gql`
      mutation createMany($data: ${createManyInputName}!) {
        ${createManyMutationName}(data: $data) {
          id
        }
      }
    `;

    this.updateMutation = gql`
      mutation update($id: ID!, $data: ${updateInputName}) {
        ${updateMutationName}(id: $id, data: $data) {
          id
        }
      }
    `;

    this.updateManyMutation = gql`
      mutation updateMany($data: [${updateManyInputName}]) {
        ${updateManyMutationName}(data: $data) {
          id
        }
      }
    `;

    this.deleteMutation = gql`
      mutation delete($id: ID!) {
        ${deleteMutationName}(id: $id) {
          id
        }
      }
    `;

    this.deleteManyMutation = gql`
      mutation deleteMany($ids: [ID!]) {
        ${deleteManyMutationName}(ids: $ids) {
          id
        }
      }
    `;
  }

  static requiredFields = ['_label_', 'id'];

  getListQuery(fields = []) {
    const queryContents = fields
      .filter(field => !List.requiredFields.includes(field.path))
      .map(field => field.getQueryFragment().trim());

    return gql`
      query getList(
        $where: ${this.gqlNames.whereInputName}
        $search: String,
        $sortBy: [${this.gqlNames.listSortName}!]
        $first: Int,
        $skip: Int
      ) {
        ${this.gqlNames.listQueryName}(
          where: $where,
          search: $search,
          sortBy: $sortBy,
          first: $first,
          skip: $skip
        ) {
          ${List.requiredFields.join('\n')}
          ${queryContents.join('\n')}
        }

        ${this.gqlNames.listQueryMetaName}(where: $where, search: $search) {
          count
        }
      }
    `;
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

  removePersistedSearch() {
    localStorage.removeItem(`search:${this.path}`);
  }

  getFullPersistentPath() {
    return `${this.fullPath}${this.getPersistedSearch() || ''}`;
  }
}
