const camelize = (exports.camelize = str =>
  str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return '';
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  }));

exports.fixConfigKeys = (config, remapKeys = {}) => {
  const rtn = {};
  Object.keys(config).forEach(key => {
    if (remapKeys[key]) rtn[remapKeys[key]] = config[key];
    else rtn[camelize(key)] = config[key];
  });
  return rtn;
};

exports.checkRequiredConfig = (config, requiredKeys = {}) => {
  Object.keys(requiredKeys).forEach(key => {
    if (config[key] === undefined) throw requiredKeys[key];
  });
};

exports.escapeRegExp = str =>
  str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

exports.resolveAllKeys = (obj) => {
  const result = {};
  const allPromises = Object.keys(obj).map(key => (
    Promise.resolve(obj[key]).then(val => {
      result[key] = val;
    })
  ));
  return Promise.all(allPromises).then(() => result);
};
