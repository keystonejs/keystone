const loaderUtils = require('loader-utils');

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

module.exports = function() {
  const options = loaderUtils.getOptions(this);
  const adminMeta = options.adminMeta;

  /* adminMeta gives us a `lists` object in the shape:
    {
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

  and our loader simply tranforms it into usuable code that looks like this:

  module.exports = {
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

  const stringifiedObject = serialize(
    Object.entries(adminMeta.lists).reduce((obj, [listPath, { views }]) => {
      obj[listPath] = views;
      return obj;
    }, {}),
    allPaths
  );

  let loaders = `{\n${[...allPaths]
    .map(path => {
      return `'${path}': () => import('${path}').then(interopDefault)`;
    })
    .join(',\n')}\n}`;

  return `
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
};
