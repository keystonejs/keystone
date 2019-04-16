import pLazy from 'p-lazy';
import pReflect from 'p-reflect';

export const camelize = str =>
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
    .join('');

export const noop = x => x;
export const identity = noop;
export const getType = thing =>
  Object.prototype.toString.call(thing).replace(/\[object (.*)\]/, '$1');

export const fixConfigKeys = (config, remapKeys = {}) => {
  const rtn = {};
  Object.keys(config).forEach(key => {
    if (remapKeys[key]) rtn[remapKeys[key]] = config[key];
    else rtn[camelize(key)] = config[key];
  });
  return rtn;
};

export const checkRequiredConfig = (config, requiredKeys = []) => {
  requiredKeys.forEach(key => {
    if (config[key] === undefined) {
      throw new Error(`Required key ${key} is not defined in the config`);
    }
  });
};

export const escapeRegExp = str =>
  (str || '').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

// { key: value, ... } => { key: mapFn(value, key), ... }
export const mapKeys = (obj, func) =>
  Object.entries(obj).reduce((acc, [key, value]) => ({ ...acc, [key]: func(value, key, obj) }), {});

// { key: value, ... } => { mapFn(key, value): value, ... }
export const mapKeyNames = (obj, func) =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => ({ ...acc, [func(key, value, obj)]: value }),
    {}
  );

export const resolveAllKeys = obj => {
  const returnValue = {};
  const errors = {};

  const allPromises = Object.keys(obj).map(key =>
    pReflect(obj[key]).then(val => {
      if (val.isFulfilled) {
        returnValue[key] = val.value;
      } else if (val.isRejected) {
        errors[key] = val.reason;
      }

      return val;
    })
  );

  return Promise.all(allPromises).then(results => {
    // If there are any errors, we want to surface them in the same shape as the
    // input object
    if (Object.keys(errors).length) {
      const firstError = results.find(({ isRejected }) => isRejected).reason;
      // Use the first error as the message so it's at least meaningful
      const error = new Error(firstError.message || firstError.toString());
      error.errors = errors;
      throw error;
    }
    return returnValue;
  });
};

export const unique = arr => [...new Set(arr)];

export const intersection = (array1, array2) =>
  unique(array1.filter(value => array2.includes(value)));

export const pick = (obj, keys) =>
  keys.reduce((acc, key) => (key in obj ? { ...acc, [key]: obj[key] } : acc), {});

export const omitBy = (obj, func) => pick(obj, Object.keys(obj).filter(value => !func(value)));

export const omit = (obj, keys) => omitBy(obj, value => keys.includes(value));

// [{ k1: v1, k2: v2, ...}, { k3: v3, k4: v4, ...}, ...] => { k1: v1, k2: v2, k3: v3, k4, v4, ... }
// Gives priority to the objects which appear later in the list
export const objMerge = objs => objs.reduce((acc, obj) => ({ ...acc, ...obj }), {});

// [x, y, z] => { x: val, y: val, z: val}
export const defaultObj = (keys, val) => keys.reduce((acc, key) => ({ ...acc, [key]: val }), {});

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
export const arrayToObject = (objs, keyedBy, mapFn = i => i) =>
  objs.reduce((acc, obj) => ({ ...acc, [obj[keyedBy]]: mapFn(obj) }), {});

// [[1, 2, 3], [4, 5], 6, [[7, 8], [9, 10]]] => [1, 2, 3, 4, 5, 6, [7, 8], [9, 10]]
export const flatten = arr => Array.prototype.concat(...arr);

// flatMap([{ vals: [2, 2] }, { vals: [3] }], x => x.vals) => [2, 2, 3]
export const flatMap = (arr, fn = identity) => flatten(arr.map(fn));

// { foo: [1, 2, 3], bar: [4, 5, 6]} => [{ foo: 1, bar: 4}, { foo: 2, bar: 5}, { foo: 3, bar: 6 }]
export const zipObj = obj =>
  Object.values(obj)[0].map((_, i) =>
    Object.keys(obj).reduce((acc, k) => ({ ...acc, [k]: obj[k][i] }), {})
  );

export const mergeWhereClause = (queryArgs, whereClauseToMergeIn) => {
  if (
    getType(whereClauseToMergeIn) !== 'Object' ||
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

export const createLazyDeferred = () => {
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
