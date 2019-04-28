const loaderUtils = require('loader-utils');
const endent = require('endent');

function serialize(value, allPaths) {
  if (typeof value === 'string') {
    allPaths.add(value);
    return `loaders['${value}']`;
  }
  if (Array.isArray(value)) {
    return `[${value.map(val => serialize(val, allPaths)).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return (
      '{\n' +
      Object.keys(value)
        .map(key => {
          // we need to use getters so circular dependencies work
          return `"${key}": ${serialize(value[key], allPaths)}`;
        })
        .join(',\n') +
      '}'
    );
  }
  throw new Error('cannot serialize value of type: ' + typeof value);
}

function findPageComponents(pages, pageComponents = {}) {
  if (!Array.isArray(pages)) return pageComponents;
  pages.forEach(page => {
    if (page.component) pageComponents[page.path] = page.component;
    else if (page.children) {
      findPageComponents(page.children, pageComponents);
    }
  });
  return pageComponents;
}

module.exports = function() {
  const options = loaderUtils.getOptions(this);
  const adminMeta = options.adminMeta;

  /* adminMeta gives us a `lists` object in the shape:
    {
      pages: [
        {
          label: 'Hello World',
          path: '/hello',
          component: 'absolute/path/to/page',
        },
      ],
      lists: {
        [listPath]: {  // e.g "User"
          ...
          access: { create, read, update, delete },
          views: {
            [fieldPath]: {  // e.g 'email'
              Controller: 'absolute/path/to/controller',
              [fieldTypeView]: 'absolute/path/to/view', // e.g 'Field'
              [fieldTypeView]: 'another/absolute/path'  // e.g 'Column'
              ...
            }
            ...
          }
        }
      }
    }

  and our loader simply tranforms it into usuable code that looks like this:

  module.exports = {
    "__pages__": {
      "/hello": require('absolute/path/to/page'),
    },
    "User": {
      "email": {
        Controller: require('absolute/path/to/controller'),
        Field: require('relative/path/to/view'),
        Column: require('another/relative/path')
        ...
      },
      ...
    }
    ...
  }
   */

  let allPaths = new Set();

  let pageComponents = findPageComponents(adminMeta.pages);

  let allViews = Object.entries(adminMeta.lists).reduce(
    (obj, [listPath, { views }]) => {
      obj[listPath] = views;
      return obj;
    },
    { __pages__: pageComponents }
  );

  const stringifiedObject = serialize(allViews, allPaths);

  let loaders = `{\n${[...allPaths]
    .map(path => {
      return `'${path}': () => import('${path}').then(interopDefault)`;
    })
    .join(',\n')}\n}`;

  const source = endent`
    let promiseCache = new Map();
    let valueCache = new Map();

    function loadView(view) {
      if (promiseCache.has(view)) {
        return promiseCache.get(view);
      }
      let promise = view().then(value => {
        valueCache.set(view, value);
      });
      promiseCache.set(view, promise);
      return promise;
    }

    export function preloadViews(views) {
      views.forEach(loadView);
    }

    export function readViews(views) {
      let promises = [];
      let values = [];
      views.forEach(view => {
        if (valueCache.has(view)) {
          values.push(valueCache.get(view));
        } else {
          promises.push(loadView(view));
        }
      });
      if (promises.length) {
        throw Promise.all(promises);
      }
      return values;
    }

    function interopDefault(mod) {
      return mod.default ? mod.default : mod;
    }

    let loaders = ${loaders};

    export let views = ${stringifiedObject}`;

  return source;
};
