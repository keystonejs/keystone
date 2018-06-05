const camelize = (exports.camelize = str =>
  str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return '';
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  }));

exports.getType = thing =>
  Object.prototype.toString.call(thing).replace(/\[object (.*)\]/, '$1');

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

exports.resolveAllKeys = obj => {
  const result = {};
  const allPromises = Object.keys(obj).map(key =>
    Promise.resolve(obj[key]).then(val => {
      result[key] = val;
    })
  );
  return Promise.all(allPromises).then(() => result);
};

exports.unique = arr => [...new Set(arr)];

exports.intersection = (array1, array2) =>
  exports.unique(array1.filter(value => array2.includes(value)));

exports.pick = (obj, keys) =>
  keys.reduce(
    (result, key) => (key in obj ? { ...result, [key]: obj[key] } : result),
    {}
  );

exports.omit = (obj, keys) =>
  exports.pick(obj, Object.keys(obj).filter(value => !keys.includes(value)));
