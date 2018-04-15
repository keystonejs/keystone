const loaderUtils =  require('loader-utils');

module.exports = function() {
  const options = loaderUtils.getOptions(this);
  const adminMeta = options.adminMeta;
  const allFieldTypeViews = {};

  Object.entries(adminMeta.lists).forEach(([listPath, list]) => {
    allFieldTypeViews[listPath] = {};

    Object.entries(list.views).forEach(([fieldName, views]) => {
      allFieldTypeViews[listPath][fieldName] = {};

      Object.entries(views).forEach(([viewType, viewPath]) => {
        const webpackSafePath = loaderUtils.stringifyRequest(this, viewPath);
        const loaderString = `require(${webpackSafePath}).default`;
        allFieldTypeViews[listPath][fieldName][viewType] = loaderString;
      });
    });
  });

  const stringifiedObject = `{
    ${Object.entries(allFieldTypeViews).map(([listPath, list]) => {
      return `"${listPath}": {
        ${Object.entries(list).map(([fieldName, views]) => {
          return `"${fieldName}": {
            ${Object.entries(views).map(([viewType, resolution]) => {
              return `"${viewType}": ${resolution}`;
            }).join(',\n')}
          }`;
        }).join(',\n')}
      }`;
    }).join(',\n')}
  }`;

  return `module.exports = ${stringifiedObject}`;
};
