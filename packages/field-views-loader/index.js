const falsey = require('falsey');
const loaderUtils = require('loader-utils');
const { unique } = require('@keystone-alpha/utils');
const memoizeOne = require('memoize-one');
const flattenDeep = require('lodash.flattendeep');

//  adminMeta gives us a `lists` object in the shape:
//  ```
//  {
//    [listPath]: {  // e.g "Post"
//      ...
//      access: { create, read, update, delete },
//      views: {
//        // e.g fieldPath1 === 'title'
//        [fieldPath1]: "@keystone-alpha/admin-view-text",
//        [fieldPath2]: ["@keystone-alpha/admin-view-text", "@keystone-alpha/admin-view-contentblock-blockquote"],
//        ...
//      }
//    }
//  }
//  ```
//
//  This loader creates a single file containing all the modules as dynamic
//  imports:
//
//  ```
//  export const loadView = viewModule => {
//    switch(viewModule) {
//      case '@keystone-alpha/admin-view-text': {
//        return import(
//          /* webpackChunkName: "keystone-alpha-admin-view-text", webpackPrefetch: true */
//          '@keystone-alpha/admin-view-text'
//        );
//      }
//      ...
//      default: {
//        return Promise.reject(new Error(`Unknown view module '${viewModule}'. Did you mean '@keystone-alpha/admin-view-text', or '...'?`));
//      }
//    }
//  }
//  export const viewMeta = {
//    "Post": {
//      "title": "@keystone-alpha/admin-view-text",
//      "post": ["@keystone-alpha/admin-view-text", "@keystone-alpha/admin-view-contentblock-blockquote"],
//      ...
//    },
//    ...
//  }
//  export const adminMeta = {
//
//  }
//  ```
//
//  This later allows writing code like:
//
//  ```
//  import { viewMeta, loadView } from './FIELD_TYPES';
//
//  const list = 'User';
//  const field = 'email';
//
//  const viewModule = FieldTypes.meta[list][field];
//
//  loadView(viewModule).then(({ Controller, Filter, ... }) => {
//    // Render here
//  });
//  ```
//
//  Webpack handles the dynamic imports making our first render nice and snappy,
//  as well as only importing the things we actually need

function serialize(value) {
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return `${value}`;
  }
  if (Array.isArray(value)) {
    return `[${unique(value)
      .map(serialize)
      .join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return `{
      ${Object.keys(value)
        .map(key => {
          return `"${key}": ${serialize(value[key])}`;
        })
        .join(',\n')}
    }`;
  }
  throw new Error('cannot serialize value of type: ' + typeof value);
}

function getCustomPageMap(pages, pathToComponents = {}) {
  // breadth first
  pages
    .filter(page => typeof page === 'object' && (!!page.path && !!page.component))
    .reduce((memo, page) => {
      // Remove children; this is a flat view of the pages
      const { children, ...flatPage } = page;
      memo[page.path] = memo[page.path] || flatPage;
      return memo;
    }, pathToComponents);

  pages
    .filter(page => typeof page === 'object' && Array.isArray(page.children))
    .reduce((memo, { children }) => getCustomPageMap(children, memo), pathToComponents);

  return pathToComponents;
}

const generateFieldViews = memoizeOne((adminMeta, injectViews) => {
  const views = {};
  let modules = [];

  // Inject the pseudo field `_label_` into each list
  const adminMetaWithLabels = {
    ...adminMeta,
    lists: Object.keys(adminMeta.lists).reduce((memo, listKey) => {
      memo[listKey] = {
        ...adminMeta.lists[listKey],
        views: {
          ...injectViews,
          ...adminMeta.lists[listKey].views,
        },
        fields: [{ label: 'Label', path: '_label_' }, ...adminMeta.lists[listKey].fields],
        adminConfig: {
          ...adminMeta.lists[listKey].adminConfig,
          defaultColumns: [
            ...Object.keys(injectViews),
            ...(adminMeta.lists[listKey].adminConfig.defaultColumns || '').split(','),
          ].join(','),
        },
      };

      // Gather up the views into a separate object
      views[listKey] = memo[listKey].views;

      // And gather up the modules individually into an array
      modules.push(Object.values(views[listKey]).map(fieldViews => Object.values(fieldViews)));

      // Remove the now duplicate data
      delete memo[listKey].views;

      return memo;
    }, {}),
  };

  const customPages = getCustomPageMap(adminMeta.pages);

  modules = unique([
    ...Object.values(customPages).map(({ component }) => component),
    ...flattenDeep(modules),
  ]);

  const result = `
    function interopDefault(mod) {
      return mod.default ? mod.default : mod;
    }
    const loaders = {};
    export const loadView = viewModule => {

      switch(viewModule) {
        ${modules
          .map(
            module => `
          case '${module}': {
            return loaders['${module}'] || (
              loaders['${module}'] = import(${
              process.env.NODE_ENV !== 'production'
                ? `
                /* webpackChunkName: "${module
                  .replace(/[^a-zA-Z0-9]+/g, '-')
                  .replace(/--+/g, '-')
                  .replace(/(^-)|(-$)/g, '')}" */`
                : ''
            }
                '${module}'
              ).then(interopDefault)
            );
          }
        `
          )
          .join('')}
        default: {
          return Promise.reject(new Error("Unknown view module '" + viewModule + "'."));
        }
      }
    }
    export const viewMeta = ${serialize(views)}
    export const adminMeta = ${require('util').inspect(adminMetaWithLabels, {
      pretty: true,
      colors: false,
      depth: null,
    })}
    export const customPages = ${serialize(customPages)}
  `;

  if (falsey(process.env.DISABLE_LOGGING)) {
    const totalLists = Object.keys(adminMeta.lists).length;
    console.log(
      `[Webpack] Processed Admin UI Schema containing ${totalLists} list${
        totalLists > 1 ? 's' : ''
      } & ${modules.length} unique view${modules.length > 1 ? 's' : ''}.`
    );
  }

  return result;
});

module.exports = function() {
  const options = loaderUtils.getOptions(this);
  const { adminMeta, injectViews } = options;

  return generateFieldViews(adminMeta, injectViews);
};

module.exports.getCustomPageMap = getCustomPageMap;
