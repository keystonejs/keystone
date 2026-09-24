import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getCallbackSelection, selectFields, wrapItemCallback } from './item-callback.ts'

type Args = { item: { id: string; title: string; status: string } }
type Callback = (args: Args) => string

test('wrapItemCallback inherits selected columns and invokes the original callback', () => {
  const original = selectFields<Callback, { title: true }>(args => args.item.title, {
    title: true,
  })
  const wrapped = wrapItemCallback(
    next => (args: Args) => `${next(args)}: ${args.item.status}`,
    { status: true },
    original
  )

  assert.equal(wrapped({ item: { id: '1', title: 'Post', status: 'draft' } }), 'Post: draft')
  assert.deepEqual(getCallbackSelection(wrapped), { title: true, status: true })
})

test('wrapItemCallback combines selections from multiple source callbacks', () => {
  const title = selectFields<Callback, { title: true }>(args => args.item.title, { title: true })
  const status = selectFields<Callback, { status: true }>(args => args.item.status, {
    status: true,
  })
  const wrapped = wrapItemCallback(
    (getTitle, getStatus) => (args: Args) => `${getTitle(args)}: ${getStatus(args)}`,
    {},
    title,
    status
  )

  assert.equal(wrapped({ item: { id: '1', title: 'Post', status: 'draft' } }), 'Post: draft')
  assert.deepEqual(getCallbackSelection(wrapped), { title: true, status: true })
})

test('wrapItemCallback keeps full-item fallback for an unselected callback', () => {
  const original: Callback = args => args.item.title
  const wrapped = wrapItemCallback(next => (args: Args) => next(args), { status: true }, original)

  assert.equal(getCallbackSelection(wrapped), 'all')
})

test('wrapItemCallback selects only its own columns without an original callback', () => {
  function wrap(original: Callback | undefined) {
    return wrapItemCallback(
      next => (args: Args) => {
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
