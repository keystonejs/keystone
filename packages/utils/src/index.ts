import pLazy from 'p-lazy';
import pReflect from 'p-reflect';
import isPromise from 'p-is-promise';
import semver from 'semver';

export const noop = <T>(x: T): T => x;
export const identity = noop;
export const getType = (thing: any) =>
  Object.prototype.toString.call(thing).replace(/\[object (.*)\]/, '$1');

export const escapeRegExp = (str: string) =>
  (str || '').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');

// { key: value, ... } => { key: mapFn(value, key), ... }
export const mapKeys = <T, R>(obj: T, func: (value: T[keyof T], key: keyof T, obj: T) => R) =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: func(value, key as keyof T, obj) }),
    {} as Record<keyof T, R>
  );

// { key: value, ... } => { mapFn(key, value): value, ... }
export const mapKeyNames = <T, R extends string>(
  obj: T,
  func: (key: keyof T, value: T[keyof T], obj: T) => R
) =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => ({ ...acc, [func(key as keyof T, value, obj)]: value }),
    {} as Record<R, T[keyof T]>
  );

type Await<TPromise extends Promise<any>> = TPromise extends Promise<infer Value> ? Value : never;

export const resolveAllKeys = async <T extends Record<string, Promise<any>>>(obj: T) => {
  const returnValue = {} as { [KK in keyof T]: Await<T[KK]> };
  const errors = {} as Record<keyof T, unknown>;

  const allPromises = (Object.keys(obj) as (keyof T)[]).map(key =>
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
    const firstReason = results.find(
      ({ isRejected }) => isRejected
    ) as pReflect.PromiseRejectedResult;
    const firstError = firstReason.reason as any;
    // Use the first error as the message so it's at least meaningful
    const error: Error & { errors?: Record<string, unknown> } = new Error(
      firstError.message || firstError.toString()
    );
    error.errors = errors;
    throw error;
  }

  return returnValue;
};

export const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

export const intersection = <T>(array1: T[], array2: T[]) =>
  unique(array1.filter(value => array2.includes(value)));

export const pick = <T, K extends keyof T>(obj: T, keys: K[]) =>
  keys.reduce(
    (acc, key) => (key in obj ? { ...acc, [key]: obj[key] } : acc),
    {} as { [P in K]: T[P] }
  );

export const omitBy = <T>(obj: T, func: (key: keyof T) => boolean) =>
  pick(
    obj,
    (Object.keys(obj) as (keyof T)[]).filter(key => !func(key))
  ) as Partial<T>;

export const omit = <T, K extends keyof T>(obj: T, keys: K[]) =>
  omitBy(obj, value => keys.includes(value as K)) as Omit<T, K>;

// [{ k1: v1, k2: v2, ...}, { k3: v3, k4: v4, ...}, ...] => { k1: v1, k2: v2, k3: v3, k4, v4, ... }
// Gives priority to the objects which appear later in the list
// See: https://fettblog.eu/typescript-union-to-intersection/
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any
  ? R
  : never;

export const objMerge = <T extends any[]>(objs: [...T]) =>
  objs.reduce((acc, obj) => ({ ...acc, ...obj }), {}) as UnionToIntersection<T[number]>;

// [x, y, z] => { x: val, y: val, z: val}
export const defaultObj = <T, K extends string>(keys: K[], val: T) =>
  keys.reduce((acc, key) => ({ ...acc, [key]: val }), {} as Record<K, T>);

export const filterValues = <T>(obj: T, predicate: (value: T[keyof T]) => boolean) =>
  Object.entries(obj).reduce(
    (acc, [key, value]) => (predicate(value) ? { ...acc, [key]: value } : acc),
    {} as Partial<T>
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
export const arrayToObject = <V extends string, T extends Record<string, V>, R>(
  objs: T[],
  keyedBy: keyof T,
  mapFn: (a: T) => R = i => i as any
) => objs.reduce((acc, obj) => ({ ...acc, [obj[keyedBy]]: mapFn(obj) }), {} as Record<V, R>);

/**
 * Concatenates child arrays one level deep.
 * @example flatten([[1, 2, 3], [4, 5], 6, [[7, 8], [9, 10]]]) => [1, 2, 3, 4, 5, 6, [7, 8], [9, 10]]
 * @param {Array} arr An array of one or more arrays
 * @returns The new array.
 */
export const flatten = <T>(arr: T[][]) => Array.prototype.concat(...arr);

// flatMap([{ vals: [2, 2] }, { vals: [3] }], x => x.vals) => [2, 2, 3]
export const flatMap = <T, U>(arr: T[], fn: (a: T) => U[]) => flatten(arr.map(fn));

// { foo: [1, 2, 3], bar: [4, 5, 6]} => [{ foo: 1, bar: 4}, { foo: 2, bar: 5}, { foo: 3, bar: 6 }]
export const zipObj = <V, T extends Record<string, V[]>>(obj: T) =>
  Object.values(obj)[0].map((_, i) =>
    Object.keys(obj).reduce((acc, k) => ({ ...acc, [k]: obj[k][i] }), {} as Record<keyof T, V>)
  );

// compose([f, g, h])(o) = h(g(f(o)))
export const compose = <T>(fns: ((a: T) => T)[]) => (o: T): T =>
  fns.reduce((acc, fn) => fn(acc), o);

export const mergeWhereClause = (
  queryArgs: Record<string, any>,
  whereClauseToMergeIn: Record<string, any>
) => {
  if (
    getType(whereClauseToMergeIn) !== 'Object' ||
    Object.keys(whereClauseToMergeIn).length === 0
  ) {
    return queryArgs;
  }

  const mergedQueryArgs =
    queryArgs.where && Object.keys(queryArgs.where).length > 0
      ? { AND: [queryArgs.where, whereClauseToMergeIn] }
      : whereClauseToMergeIn;

  return {
    ...queryArgs,
    where: mergedQueryArgs,
  };
};

export const createLazyDeferred = <T, S>() => {
  let state: 'resolved' | 'rejected' | undefined;
  let resolvedWith: T;
  let rejectedWith: S;
  let resolveCallback: (val: T) => void;
  let rejectCallback: (error: S) => void;

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
    resolve: (val: T) => {
      if (resolveCallback) {
        resolveCallback(val);
      } else {
        resolvedWith = val;
        state = 'resolved';
      }
    },
    reject: (error: S) => {
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
export const captureSuspensePromises = <T>(executors: (() => T)[]) => {
  const values: T[] = [];
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
export const countArrays = (obj: Record<string, any[]>) =>
  Object.values(obj).reduce((total, items) => total + (items ? items.length : 0), 0);

/**
 * Compares two version strings or number arrays in the major.minor.patch format.
 * @param {Array<Number>|String} comp The version to compare.
 * @param {Array<Number>|String} base The version against which to compare.
 * @returns True if each element of comp is greater than or equal base.
 */
export const versionGreaterOrEqualTo = (
  comp: Parameters<typeof semver.coerce>[0],
  base: Parameters<typeof semver.coerce>[0]
) => {
  const parseVersion = (input: Parameters<typeof semver.coerce>[0]) => {
    if (input instanceof Array) {
      return semver.coerce(input.join('.'));
    }
    return semver.coerce(input);
  };

  const v1 = parseVersion(comp);
  const v2 = parseVersion(base);
  if (v1 === null) return false;
  if (v2 === null) return true;
  return semver.gte(v1, v2);
};

/**
 * Converts the first character of a string to uppercase.
 * @param {String} str The string to convert.
 * @returns The new string
 */
export const upcase = (str: string) => str.substr(0, 1).toUpperCase() + str.substr(1);

/**
 * Iteratively execute a callback against each item in an array.
 * @param {Array} array An array of items.
 * @param {Function} callback A callback function returning a promise.
 */
export const asyncForEach = async <T>(
  array: T[],
  callback: (item: T, index: number, array: T[]) => Promise<void>
) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
