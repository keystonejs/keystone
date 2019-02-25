import gql from 'graphql-tag';

import { viewMeta, loadView } from '../FIELD_TYPES';
import { arrayToObject } from '@voussoir/utils';

export const gqlCountQueries = lists => gql`{
  ${lists.map(list => list.countQuery()).join('\n')}
}`;

export default class List {
  constructor(config, adminMeta) {
    this.config = config;
    this.adminMeta = adminMeta;

    // TODO: undo this
    Object.assign(this, config);
    delete this.fields;

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
        ${this.gqlNames.updateMutationName}(data: $data) {
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

  /**
   * @return Promise<undefined> resolves when all the field modules are loaded
   */
  initFields() {
    // Ensure we only trigger loading once, and any new requests to load are
    // resolved when the first request is resolved (or rejected);
    if (!this._loadingPromise) {
      // NOTE: We purposely don't `await` here as we want the `_loadingPromise` to
      // be resolved _after_ the `.then()` because it contains the
      // `this._fields` assignment.
      this._loadingPromise = Promise.all(
        this.config.fields.map(fieldConfig => loadView(viewMeta[this.config.key][fieldConfig.path]))
      ).then(fieldModules => {
        this._fields = fieldModules.map(({ Controller, ...views }, index) => {
          const controller = new Controller(this.config.fields[index], this, this.adminMeta);
          // Mix the `.views` fields into the controller for use throughout the
          // UI
          controller.views = views;
          return controller;
        });

        // Flag as loaded
        this._fieldsLoaded = true;
      });
    }

    return this._loadingPromise;
  }

  getFields() {
    if (!this.loaded()) {
      throw new Error(
        `Attempted to read fields from list ${this.config.key} before they were laoded`
      );
    }
    return this._fields;
  }

  loaded() {
    return !!this._fieldsLoaded;
  }

  buildQuery(queryName, queryArgs = '', fields = []) {
    return `
      ${queryName}${queryArgs} {
        id
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
      ${this.buildQuery(
        this.gqlNames.itemQueryName,
        `(where: { id: "${itemId}" })`,
        this.getFields()
      )}
    }`;
  }

  getQuery({ fields, filters, search, orderBy, skip, first }) {
    const queryArgs = List.getQueryArgs({ first, filters, search, skip, orderBy });
    const metaQueryArgs = List.getQueryArgs({ filters, search });
    return gql`{
      ${this.buildQuery(this.gqlNames.listQueryName, queryArgs, fields)}
      ${this.countQuery(metaQueryArgs)}
    }`;
  }

  getBasicQuery() {
    // TODO: How can we replace this with field.Controller.getQueryFragment()?
    return gql`{
      ${this.buildQuery(this.gqlNames.listQueryName)}
    }`;
  }

  countQuery(metaQueryArgs = '') {
    return `${this.gqlNames.listQueryMetaName}${metaQueryArgs} { count }`;
  }

  getInitialItemData() {
    return arrayToObject(this.getFields().filter(field => field.isEditable()), 'path', field =>
      field.getInitialData()
    );
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
