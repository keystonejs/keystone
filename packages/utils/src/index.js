import pLazy from 'p-lazy';
import pReflect from 'p-reflect';
import isPromise from 'p-is-promise';
import semver from 'semver';

export const noop = x => x;
export const identity = noop;
export const getType = thing =>
  Object.prototype.toString.call(thing).replace(/\[object (.*)\]/, '$1');

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

export const resolveAllKeys = async obj => {
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

  const results = await Promise.all(allPromises);

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
};

export const unique = arr => [...new Set(arr)];

export const intersection = (array1, array2) =>
  unique(array1.filter(value => array2.includes(value)));

export const pick = (obj, keys) =>
  keys.reduce((acc, key) => (key in obj ? { ...acc, [key]: obj[key] } : acc), {});

export const omitBy = (obj, func) =>
  pick(
    obj,
    Object.keys(obj).filter(value => !func(value))
  );

export const omit = (obj, keys) => omitBy(obj, value => keys.includes(value));

// [{ k1: v1, k2: v2, ...}, { k3: v3, k4: v4, ...}, ...] => { k1: v1, k2: v2, k3: v3, k4, v4, ... }
// Gives priority to the objects which appear later in the list
export const objMerge = objs => objs.reduce((acc, obj) => ({ ...acc, ...obj }), {});

// [x, y, z] => { x: val, y: val, z: val}
export const defaultObj = (keys, val) => keys.reduce((acc, key) => ({ ...acc, [key]: val }), {});

export const filterValues = (obj, predicate) =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => (predicate(value) ? { ...acc, [key]: value } : acc),
    {}
  );

/**
 * Given an array of objects, returns a single new object keyed by a given property of each input object
 * and transformed by a given function.
 *
 * @example [x, y, z] => { x[keyedBy]: mapFn(x), ... }
 * @example
 * arrayToObject([
 *  { name: 'a', animal: 'cat' },
 *  { name: 'b', animal: 'dog' },
 *  { name: 'c', animal: 'cat' },
 *  { name: 'd', animal: 'dog' }
 * ], 'name', o => o.animal);
 *
 * // Would give
 * {
 *   a: 'cat',
 *   b: 'dog',
 *   c: 'cat',
 *   d: 'dog'
 * }
 *
 * @param {Object} objs An array of objects. These should have the same properties.
 * @param {String} keyedBy The property on the input objects to key the result.
 * @param {Function} mapFn A function returning the output object values. Takes each full input object.
 */
export const arrayToObject = (objs, keyedBy, mapFn = i => i) =>
  objs.reduce((acc, obj) => ({ ...acc, [obj[keyedBy]]: mapFn(obj) }), {});

/**
 * Concatenates child arrays one level deep.
 * @example flatten([[1, 2, 3], [4, 5], 6, [[7, 8], [9, 10]]]) => [1, 2, 3, 4, 5, 6, [7, 8], [9, 10]]
 * @param {Array} arr An array of one or more arrays
 * @returns The new array.
 */
export const flatten = arr => Array.prototype.concat(...arr);

// flatMap([{ vals: [2, 2] }, { vals: [3] }], x => x.vals) => [2, 2, 3]
export const flatMap = (arr, fn = identity) => flatten(arr.map(fn));

// { foo: [1, 2, 3], bar: [4, 5, 6]} => [{ foo: 1, bar: 4}, { foo: 2, bar: 5}, { foo: 3, bar: 6 }]
export const zipObj = obj =>
  Object.values(obj)[0].map((_, i) =>
    Object.keys(obj).reduce((acc, k) => ({ ...acc, [k]: obj[k][i] }), {})
  );

// compose([f, g, h])(o) = h(g(f(o)))
export const compose = fns => o => fns.reduce((acc, fn) => fn(acc), o);

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

/**
 * Given an array of functions which may throw a Promise when executed, we want
 * to ensure all functions are executed, reducing any thrown Promises to a
 * single Promise, which is itself rethrown.
 * If no Promises are thrown, this is the equivalent of a .map
 * @param {Array} executors
 */
export const captureSuspensePromises = executors => {
  const values = [];
  const promises = executors
    .map(executor => {
      try {
        values.push(executor());
      } catch (loadingPromiseOrError) {
        // An actual error was thrown, so we want to bubble that up
        if (!isPromise(loadingPromiseOrError)) {
          throw loadingPromiseOrError;
        }
        // Return a Suspense promise
        return loadingPromiseOrError;
      }
    })
    .filter(Boolean);

  if (promises.length) {
    // All the suspense promises are reduced to a single promise then rethrown
    throw Promise.all(promises);
  }

  return values;
};

/**
 * Returns the length of all arrays in obj
 * @param {*} obj An objects whose property values are arrays.
 */
export const countArrays = obj =>
  Object.values(obj).reduce((total, items) => total + (items ? items.length : 0), 0);

/**
 * Compares two version strings or number arrays in the major.minor.patch format.
 * @param {Array<Number>|String} comp The version to compare.
 * @param {Array<Number>|String} base The version against which to compare.
 * @returns True if each element of comp is greater than or equal base.
 */
export const versionGreaterOrEqualTo = (comp, base) => {
  const parseVersion = input => {
    if (input instanceof Array) {
      input = input.join('.');
    }
    return semver.coerce(input);
  };

  const v1 = parseVersion(comp);
  const v2 = parseVersion(base);
  return semver.gte(v1, v2);
};

/**
 * Converts the first character of a string to uppercase.
 * @param {String} str The string to convert.
 * @returns The new string
 */
export const upcase = str => str.substr(0, 1).toUpperCase() + str.substr(1);

/**
 * Iteratively execute a callback against each item in an array.
 * @param {Array} array An array of items.
 * @param {Function} callback A callback function returning a promise.
 */
export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
