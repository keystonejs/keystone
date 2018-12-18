const pLazy = require('p-lazy');

const camelize = (exports.camelize = str =>
  // split the string into words, lowercase the leading character of the first word,
  // uppercase the leading character of all other words, then join together.
  // If the first word is all uppercase, lowercase the whole thing.
  str
    .split(' ')
    .filter(w => w)
    .map((w, i) =>
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

exports.escapeRegExp = str => (str || '').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

// { key: value, ... } => { key: mapFn(value, key), ... }
exports.mapKeys = (obj, func) =>
  Object.entries(obj).reduce((acc, [key, value]) => ({ ...acc, [key]: func(value, key, obj) }), {});

// { key: value, ... } => { mapFn(key, value): value, ... }
exports.mapKeyNames = (obj, func) =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => ({ ...acc, [func(key, value, obj)]: value }),
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
  keys.reduce((acc, key) => (key in obj ? { ...acc, [key]: obj[key] } : acc), {});

exports.omit = (obj, keys) =>
  exports.pick(obj, Object.keys(obj).filter(value => !keys.includes(value)));

// [{ k1: v1, k2: v2, ...}, { k3: v3, k4: v4, ...}, ...] => { k1: v1, k2: v2, k3: v3, k4, v4, ... }
// Gives priority to the objects which appear later in the list
exports.objMerge = objs => objs.reduce((acc, obj) => ({ ...acc, ...obj }), {});

// [x, y, z] => { x: val, y: val, z: val}
exports.defaultObj = (keys, val) => keys.reduce((acc, key) => ({ ...acc, [key]: val }), {});

// [x, y, z] => { x[keyedBy]: mapFn(x), ... }
// [{ name: 'a', animal: 'cat' },
//  { name: 'b', animal: 'dog' },
//  { name: 'c', animal: 'cat' },
//  { name: 'd', animal: 'dog' }]
// arraytoObject(obj, 'name', o => o.animal) =>
// { a: 'cat',
//   b: 'dog',
//   c: 'cat',
//   d: 'dog'}
exports.arrayToObject = (objs, keyedBy, mapFn = i => i) =>
  objs.reduce((acc, obj) => ({ ...acc, [obj[keyedBy]]: mapFn(obj) }), {});

// [[1, 2, 3], [4, 5], 6, [[7, 8], [9, 10]]] => [1, 2, 3, 4, 5, 6, [7, 8], [9, 10]]
exports.flatten = arr => Array.prototype.concat(...arr);

// { foo: [1, 2, 3], bar: [4, 5, 6]} => [{ foo: 1, bar; 4}, { foo: 2, bar: 5}, { foo: 3, bar: 6 }]
exports.zipObj = obj =>
  Object.values(obj)[0].map((_, i) =>
    Object.keys(obj).reduce((acc, k) => ({ ...acc, [k]: obj[k][i] }), {})
  );

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

exports.createLazyDeferred = () => {
  let state;
  let resolvedWith;
  let rejectedWith;
  let resolveCallback;
  let rejectCallback;

  const promise = new pLazy((resolve, reject) => {
    if (state === 'resolved') {
      resolve(resolvedWith);
    } else if (state === 'rejected') {
      reject(rejectedWith);
    } else {
      resolveCallback = resolve;
      rejectCallback = reject;
    }
  });

  return {
    promise,
    resolve: val => {
      if (resolveCallback) {
        resolveCallback(val);
      } else {
        resolvedWith = val;
        state = 'resolved';
      }
    },
    reject: error => {
      if (rejectCallback) {
        rejectCallback(error);
      } else {
        rejectedWith = error;
        state = 'rejected';
      }
    },
  };
};
