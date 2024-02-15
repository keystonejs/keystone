import { humanize } from '../src/lib/utils'

describe('utils', () => {
  test('humanize()', () => {
    expect(humanize('helloDarknessMyOldFriend')).toBe('Hello Darkness My Old Friend')
    expect(humanize('someHTML')).toBe('Some HTML')
    expect(humanize('snake_case')).toBe('Snake Case')
    expect(humanize('kebab-case')).toBe('Kebab Case')
    expect(humanize('multiple words here')).toBe('Multiple Words Here')
    expect(humanize('Multiple Words Here')).toBe('Multiple Words Here')
    expect(humanize('foo')).toBe('Foo')
    expect(humanize('Foo')).toBe('Foo')
    expect(humanize('fooBar')).toBe('Foo Bar')
    expect(humanize('FooBar')).toBe('Foo Bar')
    expect(humanize('Foo Bar')).toBe('Foo Bar')
  })
})
