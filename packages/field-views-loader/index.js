const loaderUtils = require('loader-utils');

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

  const stringifiedObject = `{
    ${Object.entries(adminMeta.lists)
      .map(([listPath, list]) => {
        return `"${listPath}": {
        ${Object.entries(list.views)
          .map(([fieldPath, views]) => {
            return `"${fieldPath}": {
              ${Object.entries(views)
                .map(([viewType, resolution]) => {
                  return `${viewType}: interopDefault(require('${resolution}'))`;
                })
                .join(',\n')}
          }`;
          })
          .join(',\n')}
      }`;
      })
      .join(',\n')}
  }`;

  return `
  function interopDefault(mod) {
    return mod.default ? mod.default : mod;
  }
  module.exports = ${stringifiedObject}`;
};
