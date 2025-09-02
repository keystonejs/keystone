import { humanize } from '../packages/core/src/lib/utils'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

describe('utils', () => {
  it('humanize()', () => {
    assert.strictEqual(humanize('helloDarknessMyOldFriend'), 'Hello Darkness My Old Friend')
    assert.strictEqual(humanize('someHTML'), 'Some HTML')
    assert.strictEqual(humanize('snake_case'), 'Snake Case')
    assert.strictEqual(humanize('kebab-case'), 'Kebab Case')
    assert.strictEqual(humanize('multiple words here'), 'Multiple Words Here')
    assert.strictEqual(humanize('Multiple Words Here'), 'Multiple Words Here')
    assert.strictEqual(humanize('foo'), 'Foo')
    assert.strictEqual(humanize('Foo'), 'Foo')
    assert.strictEqual(humanize('fooBar'), 'Foo Bar')
    assert.strictEqual(humanize('FooBar'), 'Foo Bar')
    assert.strictEqual(humanize('Foo Bar'), 'Foo Bar')
  })
})
