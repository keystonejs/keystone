import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { humanize } from '../packages/core/src/lib/utils'

describe('utils', () => {
  test('humanize()', () => {
    assert.equal(humanize('helloDarknessMyOldFriend'), 'Hello Darkness My Old Friend')
    assert.equal(humanize('someHTML'), 'Some HTML')
    assert.equal(humanize('snake_case'), 'Snake Case')
    assert.equal(humanize('kebab-case'), 'Kebab Case')
    assert.equal(humanize('multiple words here'), 'Multiple Words Here')
    assert.equal(humanize('Multiple Words Here'), 'Multiple Words Here')
    assert.equal(humanize('Thing42WithOther43'), 'Thing42 With Other43')
    assert.equal(humanize('Thing42_withOther43', false), 'Thing42 with Other43')
    assert.equal(humanize('foo'), 'Foo')
    assert.equal(humanize('Foo'), 'Foo')
    assert.equal(humanize('fooBar'), 'Foo Bar')
    assert.equal(humanize('FooBar'), 'Foo Bar')
    assert.equal(humanize('Foo Bar'), 'Foo Bar')
  })
})
