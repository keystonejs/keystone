const {
  camelize,
  getType,
  fixConfigKeys,
  checkRequiredConfig,
  escapeRegExp,
  mapKeys,
  resolveAllKeys,
  unique,
  intersection,
  pick,
  omit,
} = require('./index');

describe('utils', () => {
  test('camelize', () => {
    expect(camelize('')).toEqual('');
    expect(camelize('a')).toEqual('a');
    expect(camelize('A')).toEqual('a');
    expect(camelize('a b')).toEqual('aB');
    expect(camelize('a B')).toEqual('aB');
    expect(camelize('A B')).toEqual('aB');
    expect(camelize('A b')).toEqual('aB');
    expect(camelize('foo bar baz')).toEqual('fooBarBaz');
    expect(camelize('Foo Bar Baz')).toEqual('fooBarBaz');
    expect(camelize('FOO BAR BAZ')).toEqual('fOOBARBAZ');
  });

  test('getType', () => {
    expect(getType(undefined)).toEqual('Undefined');
    expect(getType(null)).toEqual('Null');
    expect(getType(0)).toEqual('Number');
    expect(getType('a')).toEqual('String');
    expect(getType({})).toEqual('Object');
    expect(getType([])).toEqual('Array');
    expect(getType(() => {})).toEqual('Function');
  });

  test('fixConfigKeys', () => {
    const config = {
      a: 1,
      foo: 2,
      FooBar: 3,
    };
    expect(fixConfigKeys(config)).toEqual({ a: 1, foo: 2, fooBar: 3 });
    expect(fixConfigKeys(config, {})).toEqual({ a: 1, foo: 2, fooBar: 3 });
    expect(fixConfigKeys(config, { foo: 'bar' })).toEqual({ a: 1, bar: 2, fooBar: 3 });
  });

  test('checkRequiredConfig', () => {
    const config = {
      a: 1,
      b: 2,
      c: 3,
    };
    expect(checkRequiredConfig(config)).toBe(undefined);
    expect(checkRequiredConfig(config, [])).toBe(undefined);
    expect(checkRequiredConfig(config, ['a', 'c'])).toBe(undefined);
    expect(() => checkRequiredConfig(config, ['a', 'c', 'd'])).toThrow(Error);
  });

  test('escapeRegExp', () => {
    const s = 'a-b/c[d]e{f}g(h)i*j+k?l.m\\n^o$p|';
    const t = 'a\\-b\\/c\\[d\\]e\\{f\\}g\\(h\\)i\\*j\\+k\\?l\\.m\\\\n\\^o\\$p\\|';
    expect(escapeRegExp(s)).toEqual(t);
    expect(escapeRegExp('abc')).toEqual('abc');
  });

  test('mapKeys', () => {
    // Simple value based function
    const o = { a: 1, b: 2, c: 3 };
    const f = x => 2 * x;
    expect(mapKeys(o, f)).toEqual({ a: 2, b: 4, c: 6 });

    // Complex value/key/object base function.
    const g = (value, key, object) => value * key.charCodeAt(0) + Object.keys(object).length;
    expect(mapKeys(o, g)).toEqual({ a: 100, b: 199, c: 300 });
  });

  test('resolveAllKeys', async () => {
    const f = async () => 10;
    const g = async () => 20;
    const o = {
      a: f(),
      b: g(),
    };
    expect(await resolveAllKeys(o)).toEqual({ a: 10, b: 20 });
  });

  test('unique', () => {
    const a = [1, 2, 3, 4, 1, 2, 3, 4, 5];
    expect(unique([])).toEqual([]);
    expect(unique(a)).toEqual([1, 2, 3, 4, 5]);
  });

  test('intersection', () => {
    const a = [1, 2, 3, 4, 1, 2, 3, 4];
    const even = [2, 4, 6, 8];
    const odd = [1, 3, 5, 7];
    expect(intersection(a, [])).toEqual([]);
    expect(intersection([], a)).toEqual([]);

    expect(intersection(a, even)).toEqual([2, 4]);
    expect(intersection(even, a)).toEqual([2, 4]);

    expect(intersection(a, odd)).toEqual([1, 3]);
    expect(intersection(odd, a)).toEqual([1, 3]);

    expect(intersection(even, odd)).toEqual([]);
    expect(intersection(odd, even)).toEqual([]);
  });

  test('pick', () => {
    const o = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    };

    // No keys, return empty object
    expect(pick(o, [])).toEqual({});
    // Pick specified keys
    expect(pick(o, ['b', 'c'])).toEqual({ b: 2, c: 3 });
    // Pick specified keys, ignore keys which don't exist
    expect(pick(o, ['b', 'c', 'e'])).toEqual({ b: 2, c: 3 });
    // o remains unchanged
    expect(o).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  test('omit', () => {
    const o = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    };

    // No keys, return same equal object
    expect(omit(o, [])).toEqual(o);
    // Remove specified keys
    expect(omit(o, ['b', 'c'])).toEqual({ a: 1, d: 4 });
    // Remove specified keys, ignore keys which don't exist
    expect(omit(o, ['b', 'c', 'e'])).toEqual({ a: 1, d: 4 });
    // o remains unchanged
    expect(o).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });
});
