import {
  resolveConditionalActionMode,
  serializeItemForConditionalFilters,
} from './conditionalFilters'

test('resolveConditionalActionMode prioritises enabled before disabled and hidden', () => {
  expect(
    resolveConditionalActionMode(
      {
        enabled: { status: { equals: 'published' } },
        disabled: { status: { equals: 'published' } },
        hidden: true,
      },
      { status: 'published' }
    )
  ).toBe('enabled')
})

test('resolveConditionalActionMode returns disabled when enabled does not match', () => {
  expect(
    resolveConditionalActionMode(
      {
        enabled: { status: { equals: 'published' } },
        disabled: { status: { equals: 'archived' } },
      },
      { status: 'archived' }
    )
  ).toBe('disabled')
})

test('resolveConditionalActionMode falls through to hidden when only hidden matches', () => {
  expect(
    resolveConditionalActionMode(
      {
        enabled: { status: { equals: 'published' } },
        disabled: { status: { equals: 'archived' } },
        hidden: { status: { equals: 'draft' } },
      },
      { status: 'draft' }
    )
  ).toBe('hidden')
})

test('serialised values reflect unsaved edits when resolving action modes', () => {
  const fields = {
    status: {
      controller: {
        serialize(value: unknown) {
          return { status: value }
        },
      },
    },
  }

  const initialSerialized = serializeItemForConditionalFilters(fields, { status: 'draft' })
  expect(
    resolveConditionalActionMode(
      {
        enabled: { status: { equals: 'published' } },
      },
      initialSerialized
    )
  ).toBe('hidden')

  const editedSerialized = serializeItemForConditionalFilters(fields, {
    status: 'published',
  })
  expect(
    resolveConditionalActionMode(
      {
        enabled: { status: { equals: 'published' } },
      },
      editedSerialized
    )
  ).toBe('enabled')
})
