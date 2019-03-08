import gql from 'graphql-tag';
import React from 'react';
import dedent from 'dedent';
import dynamic from 'next/dynamic';
import { arrayToObject, mapKeys } from '@keystone-alpha/utils';

import PageLoading from '../components/PageLoading';
import PageError from '../components/PageError';
import { viewMeta, loadView } from '../FIELD_TYPES';

export const gqlCountQueries = lists => gql`{
  ${lists.map(list => list.countQuery()).join('\n')}
}`;

const ControllerLoading = ({ error, pastDelay }) => {
  // avoid flash-of-loading-component
  if (!pastDelay) return null;
  if (error) {
    return (
      <PageError>
        {process.env.NODE_ENV === 'production'
          ? 'There was an error loading the page'
          : error.message || error.toString()}
      </PageError>
    );
  }
  return <PageLoading />;
};

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

    this._component = dynamic({
      // Create an object of field paths to load functions;
      // {
      //   name: () => import('@keystone-alpha/fields/text/Controller'),
      // }
      modules: () => mapKeys(this._getFieldControllerModules(), module => () => loadView(module)),
      loading: ControllerLoading,
      render: ({ children }, controllers) => {
        if (!this.controllersLoaded()) {
          this._setFieldControllers(controllers);
        }
        return children;
      },
    });
  }

  /**
   * An object of field path to module name:
   * {
   *   _label_: '@keystone-alpha/fields/pseudolable/Controller',
   *   name: '@keystone-alpha/fields/text/Controller',
   * }
   */
  _getFieldControllerModules() {
    return this.config.fields.reduce((memo, fieldConfig) => {
      memo[fieldConfig.path] = viewMeta[this.config.key][fieldConfig.path].Controller;
      return memo;
    }, {});
  }

  _setFieldControllers(controllers) {
    this.fieldControllers = controllers;
    this._controllersLoaded = true;

    this._fieldControllers = this.config.fields.map(fieldConfig => {
      const Controller = controllers[fieldConfig.path];
      const controller = new Controller(fieldConfig, this, this.adminMeta);
      // Mix the `.views` fields into the controller for use throughout the
      // UI
      controller.views = viewMeta[this.config.key][fieldConfig.path];
      return controller;
    });
  }

  controllersLoaded() {
    return !!this._controllersLoaded;
  }

  getFieldControllers() {
    if (!this.controllersLoaded()) {
      throw new Error(dedent`
        Attempted to read fields from list ${this.config.key} before they were loaded.
        Be sure to wrap your render tree inside the component returned from .getComponent():
          const List = list.getComponent();
          return (
            <List>
              <h1>Hello world</h2>
            </List>
          );
      `);
    }
    return this._fieldControllers;
  }

  getComponent() {
    return this._component;
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
        this.getFieldControllers()
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
    return arrayToObject(
      this.getFieldControllers().filter(field => field.isEditable()),
      'path',
      field => field.getInitialData()
    );
  }
  formatCount(items) {
    const count = Array.isArray(items) ? items.length : items;
    return count === 1 ? `1 ${this.singular}` : `${count} ${this.plural}`;
  }
  getPersistedSearch() {
    if (typeof localStorage === 'undefined') {
      return {};
    }
    try {
      return JSON.parse(localStorage.getItem(`search:${this.config.path}`));
    } catch (error) {
      // If it's a parse failure, it's because we've never set a value, or the
      // value is corrupt. We set a default value now.
      this.setPersistedSearch({});
      return {};
    }
  }
  setPersistedSearch(value) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`search:${this.config.path}`, JSON.stringify(value));
    }
  }
}
