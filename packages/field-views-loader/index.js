const falsey = require('falsey');
const loaderUtils = require('loader-utils');
const { flatten, unique } = require('@voussoir/utils');

//  adminMeta gives us a `lists` object in the shape:
//  ```
//  {
//    [listPath]: {  // e.g "Post"
//      ...
//      access: { create, read, update, delete },
//      views: {
//        // e.g fieldPath1 === 'title'
//        [fieldPath1]: "@voussoir/admin-view-text",
//        [fieldPath2]: ["@voussoir/admin-view-text", "@voussoir/admin-view-contentblock-blockquote"],
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
//      case '@voussoir/admin-view-text': {
//        return import(
//          /* webpackChunkName: "voussoir-admin-view-text", webpackPrefetch: true */
//          '@voussoir/admin-view-text'
//        );
//      }
//      ...
//      default: {
//        return Promise.reject(new Error(`Unknown view module '${viewModule}'. Did you mean '@voussoir/admin-view-text', or '...'?`));
//      }
//    }
//  }
//  export const viewMeta = {
//    "Post": {
//      "title": "@voussoir/admin-view-text",
//      "post": ["@voussoir/admin-view-text", "@voussoir/admin-view-contentblock-blockquote"],
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
  if (Array.isArray(value)) {
    return `[${unique(value)
      .map(serialize)
      .join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return `{
      ${Object.keys(value)
        .map(key => {
          // we need to use getters so circular dependencies work
          return `get "${key}"() { return ${serialize(value[key])}; }`;
        })
        .join(',\n')}
    }`;
  }
  throw new Error('cannot serialize value of type: ' + typeof value);
}

module.exports = function() {
  const options = loaderUtils.getOptions(this);
  // TODO: FIXME: Deep copy this object as we modify it below
  const adminMeta = options.adminMeta;

  // Inject the psuedo field `_label_` into each list
  const adminMetaWithLabels = {
    ...adminMeta,
    lists: Object.keys(adminMeta.lists).reduce((memo, listKey) => {
      memo[listKey] = {
        ...adminMeta.lists[listKey],
        views: {
          _label_: '@voussoir/admin-view-pseudolabel',
          ...adminMeta.lists[listKey].views,
        },
        fields: [{ label: 'Label', path: '_label_' }, ...adminMeta.lists[listKey].fields],
        adminConfig: {
          ...adminMeta.lists[listKey].adminConfig,
          defaultColumns: [
            '_label_',
            ...(adminMeta.lists[listKey].adminConfig.defaultColumns || '').split(','),
          ].join(','),
        },
      };
      return memo;
    }, {}),
  };

  const modules = unique(
    flatten(
      Object.values(adminMetaWithLabels.lists).map(({ views }) => flatten(Object.values(views)))
    )
  );

  const metaObject = `{
    ${Object.entries(adminMetaWithLabels.lists)
      .map(([listPath, list]) => {
        try {
          return `"${listPath}": ${serialize(list.views)}`;
        } catch (error) {
          console.error(
            require('util').inspect(
              { [listPath]: list },
              { color: false, depth: null, pretty: true }
            )
          );
          throw error;
        }
      })
      .join(',\n')}
  }`;

  const result = `
    const loaders = [];
    export const loadView = viewModule => {
      switch(viewModule) {
        ${modules
          .map(
            module => `
          case '${module}': {
            if (!loaders['${module}']) {
              loaders['${module}'] = import(
                /* webpackChunkName: "${module
                  .replace(/[^a-zA-Z0-9]+/g, '-')
                  .replace(/--+/g, '-')
                  .replace(/(^-)|(-$)/g, '')}" */
                '${module}'
              );
            }
            return loaders['${module}'];
          }
        `
          )
          .join('\n')}
        default: {
          return Promise.reject(new Error("Unknown view module '" + viewModule + "'. Did you mean ${modules
            .map(module => `'${module}'`)
            .join(', or ')}?"));
        }
      }
    }
    export const viewMeta = ${metaObject}
    export const adminMeta = ${require('util').inspect(adminMetaWithLabels, {
      pretty: true,
      colors: false,
      depth: null,
    })}
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
};
