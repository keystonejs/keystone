import { upcase, humanize } from '../src/lib/utils';

describe('utils', () => {
  test('humanize()', () => {
    expect(humanize('helloDarknessMyOldFriend')).toBe('Hello Darkness My Old Friend');
    expect(humanize('someHTML')).toBe('Some HTML');
    expect(humanize('snake_case')).toBe('Snake Case');
    expect(humanize('kebab-case')).toBe('Kebab Case');
    expect(humanize('multiple words here')).toBe('Multiple Words Here');
    expect(humanize('Multiple Words Here')).toBe('Multiple Words Here');
  });

  test('upcase', () => {
    expect(upcase('Foo')).toEqual('Foo');
    expect(upcase('foo')).toEqual('Foo');
    expect(upcase('FooBar')).toEqual('FooBar');
    expect(upcase('fooBar')).toEqual('FooBar');
    expect(upcase('Foo bar')).toEqual('Foo bar');
    expect(upcase('foo bar')).toEqual('Foo bar');
    expect(upcase('Foo Bar')).toEqual('Foo Bar');
    expect(upcase('foo Bar')).toEqual('Foo Bar');
  });
});
