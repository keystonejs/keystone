import assert from 'node:assert/strict'
import { test } from 'node:test'

import { allowAll, denyAll, unfiltered } from '../access.ts'
import { callbackReadsItemField, getCallbackSelection, selectItem } from './item-callback.ts'

type Args = { item: { id: string; title: string; status: string } }
type Callback = (args: Args) => string

test('built-in access callbacks do not require item fields', () => {
  for (const callback of [allowAll, denyAll, unfiltered]) {
    assert.deepEqual(getCallbackSelection(callback), {})
    assert.equal(callbackReadsItemField(callback), false)
  }
})

test('selectItem.wrap inherits selected columns and invokes the original callback', () => {
  const original = selectItem<Args, string, { title: true }>(args => args.item.title, {
    title: true,
  })
  const wrapped = selectItem.wrap(
    next => args => `${next(args)}: ${args.item.status}`,
    { status: true },
    original
  )

  assert.equal(wrapped({ item: { id: '1', title: 'Post', status: 'draft' } }), 'Post: draft')
  assert.deepEqual(getCallbackSelection(wrapped), { title: true, status: true })
})

test('selectItem.wrap combines selections from multiple source callbacks', () => {
  const title = selectItem<Args, string, { title: true }>(args => args.item.title, { title: true })
  const status = selectItem<Args, string, { status: true }>(args => args.item.status, {
    status: true,
  })
  const wrapped = selectItem.wrap(
    (getTitle, getStatus) => args => `${getTitle(args)}: ${getStatus(args)}`,
    {},
    title,
    status
  )

  assert.equal(wrapped({ item: { id: '1', title: 'Post', status: 'draft' } }), 'Post: draft')
  assert.deepEqual(getCallbackSelection(wrapped), { title: true, status: true })
})

test('selectItem.wrap keeps full-item fallback for an unselected callback', () => {
  const original: Callback = args => args.item.title
  const wrapped = selectItem.wrap(next => args => next(args), { status: true }, original)

  assert.equal(getCallbackSelection(wrapped), 'all')
})

test('selectItem.wrap selects only its own columns without an original callback', () => {
  function wrap(original: Callback | undefined) {
    return selectItem.wrap(
      next => args => {
        assert.equal(next, undefined)
        return args.item.status
      },
      {
        status: true,
      },
      original
    )
  }
  const wrapped = wrap(undefined)

  assert.equal(wrapped({ item: { id: '1', title: 'Post', status: 'draft' } }), 'draft')
  assert.deepEqual(getCallbackSelection(wrapped), { status: true })
})

test('selectItem.wrap unions enabled columns without erasing inherited requirements', () => {
  const title = selectItem<Args, string, { title: true }>(args => args.item.title, { title: true })
  const optionalTitle = selectItem<Args, string, { title?: true }>(() => '', { title: undefined })
  const wrapped = selectItem.wrap(
    (getTitle, getOptionalTitle) => args => getTitle(args) + getOptionalTitle(args),
    { title: undefined, status: true },
    title,
    optionalTitle
  )

  const selection = getCallbackSelection(wrapped)
  assert.deepEqual(selection, { title: true, status: true })
  assert.notEqual(selection, 'all')
  assert.equal(wrapped({ item: { id: '1', title: 'Post', status: 'draft' } }), 'Post')
})
