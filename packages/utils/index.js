const camelize = (exports.camelize = str =>
  // split the string into words (by whitespace), lowercase the leading character of the first word,
  // uppercase the leading character of all other words, then join together.
  str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
    if (+match === 0) return '';
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  }));

exports.getType = thing => Object.prototype.toString.call(thing).replace(/\[object (.*)\]/, '$1');

exports.fixConfigKeys = (config, remapKeys = {}) => {
  const rtn = {};
  Object.keys(config).forEach(key => {
    if (remapKeys[key]) rtn[remapKeys[key]] = config[key];
    else rtn[camelize(key)] = config[key];
  });
  return rtn;
};

exports.checkRequiredConfig = (config, requiredKeys = []) => {
  requiredKeys.forEach(key => {
    if (config[key] === undefined) {
      throw new Error(`Required key ${key} is not defined in the config`);
    }
  });
};

exports.escapeRegExp = str => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

exports.mapKeys = (obj, func) =>
  Object.entries(obj).reduce(
    (memo, [key, value]) => ({ ...memo, [key]: func(value, key, obj) }),
    {}
  );

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
  keys.reduce((result, key) => (key in obj ? { ...result, [key]: obj[key] } : result), {});

exports.omit = (obj, keys) =>
  exports.pick(obj, Object.keys(obj).filter(value => !keys.includes(value)));
