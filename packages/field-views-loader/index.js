const path = require('path');
const loaderUtils =  require('loader-utils');

module.exports = function() {
  const options = loaderUtils.getOptions(this);
  const adminMeta = options.adminMeta;
  const allFieldTypeViews = {};

  Object.values(adminMeta.lists).forEach(list => {
    list.fields.forEach(field => {
      const basePath = field.basePath;
      const fieldType = field.type;
      allFieldTypeViews[fieldType] = allFieldTypeViews[fieldType] || {};
      Object.entries(field.views).forEach(([viewType, viewPath]) => {
        const absolutePath = path.resolve(basePath, viewPath);
        const webpackSafePath = loaderUtils.stringifyRequest(this, absolutePath);
        const loaderString = `require(${webpackSafePath}).default`;
        allFieldTypeViews[fieldType][viewType] = loaderString;
      });
    });
  });

  const stringifiedObject = `{
    ${Object.entries(allFieldTypeViews).map(([fieldType, views]) => {
      return `"${fieldType}": {
        ${Object.entries(views).map(([viewType, resolution]) => {
          return `"${viewType}": ${resolution}`;
        }).join(',\n')}
      }`;
    }).join(',\n')}
  }`;

  return `module.exports = ${stringifiedObject}`;
};
