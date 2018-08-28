const camelize = (exports.camelize = str =>
  // split the string into words, lowercase the leading character of the first word,
  // uppercase the leading character of all other words, then join together.
  // If the first word is all uppercase, lowercase the whole thing.
  str
    .split(' ')
    .filter(w => w)
    .map(
      (w, i) =>
        i === 0
          ? w === w.toUpperCase()
            ? w.toLowerCase()
            : w.replace(/\S/, c => c.toLowerCase())
          : w.replace(/\S/, c => c.toUpperCase())
    )
    .join(''));

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

exports.mergeWhereClause = (queryArgs, whereClauseToMergeIn) => {
  if (
    exports.getType(whereClauseToMergeIn) !== 'Object' ||
    Object.keys(whereClauseToMergeIn).length === 0
  ) {
    return queryArgs;
  }

  const mergedQueryArgs =
    queryArgs.where && Object.keys(queryArgs.where).length > 0
      ? {
          AND: [queryArgs.where, whereClauseToMergeIn],
        }
      : whereClauseToMergeIn;

  return {
    ...queryArgs,
    where: mergedQueryArgs,
  };
};
