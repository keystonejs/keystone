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
    assert.equal(humanize('foo'), 'Foo')
    assert.equal(humanize('Foo'), 'Foo')
    assert.equal(humanize('fooBar'), 'Foo Bar')
    assert.equal(humanize('FooBar'), 'Foo Bar')
    assert.equal(humanize('Foo Bar'), 'Foo Bar')
    assert.equal(humanize('Foo11WithBar11'), 'Foo11 With Bar11')
    assert.equal(humanize('Foo1A_WithBar11'), 'Foo1A With Bar11')
    assert.equal(humanize('Foo1AA_WithBar11'), 'Foo1 AA With Bar11')
    assert.equal(humanize('Foo11_WithBar11'), 'Foo11 With Bar11')
    assert.equal(humanize('Foo11_WithBar11A'), 'Foo11 With Bar11A')
    assert.equal(humanize('Foo11_WithBar11AA'), 'Foo11 With Bar11 AA')
    assert.equal(humanize('Foo11_withBar11', false), 'Foo11 with Bar11')
    assert.equal(humanize('FOO1A_BAR11'), 'FOO1A BAR11')
    assert.equal(humanize('FOO1A1_BAR11'), 'FOO1 A1 BAR11')
  })
})
