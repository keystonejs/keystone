const loaderUtils = require('loader-utils');

function serialize(value) {
  if (typeof value === 'string') {
    return `interopDefault(require('${value}'))`;
  }
  if (Array.isArray(value)) {
    return `[${value.map(serialize).join(', ')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    return (
      '{\n' +
      Object.keys(value)
        .map(key => {
          // we need to use getters so circular dependencies work
          return `get "${key}"() { return ${serialize(value[key])}; }`;
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

  const stringifiedObject = serialize(
    Object.entries(adminMeta.lists).reduce((obj, [listPath, { views }]) => {
      obj[listPath] = views;
      return obj;
    }, {})
  );

  return `
  function interopDefault(mod) {
    return mod.default ? mod.default : mod;
  }
  module.exports = ${stringifiedObject}`;
};
