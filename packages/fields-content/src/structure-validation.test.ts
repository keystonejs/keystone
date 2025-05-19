import { describe, expect, test } from 'vitest'
import { editorOptionsToConfig } from './config.ts'
import {
  createContentStorageSchema,
  defaultContentValue,
  validateContentStructure,
} from './structure-validation.ts'

const config = editorOptionsToConfig({})

describe('content storage validation', () => {
  test('accepts the default ProseMirror document', () => {
    expect(createContentStorageSchema(config).safeParse(defaultContentValue).success).toBe(true)
  })

  test('accepts built-in nodes and marks', () => {
    expect(
      createContentStorageSchema(config).safeParse({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [
              {
                type: 'text',
                text: 'Hello',
                marks: [
                  { type: 'bold' },
                  { type: 'link', attrs: { href: 'https://keystonejs.com', title: '' } },
                ],
              },
            ],
          },
          {
            type: 'ordered_list',
            attrs: { start: 1 },
            content: [
              {
                type: 'list_item',
                content: [{ type: 'paragraph' }],
              },
            ],
          },
        ],
      }).success
    ).toBe(true)
  })

  test('rejects the old Slate document format', () => {
    expect(() => {
      validateContentStructure(
        [{ type: 'paragraph', children: [{ text: '' }] }],
        editorOptionsToConfig({})
      )
    }).toThrow('Invalid content structure')
  })

  test('requires a doc at the root', () => {
    expect(createContentStorageSchema(config).safeParse({ type: 'paragraph' }).success).toBe(false)
  })

  test('rejects invalid node nesting', () => {
    const result = createContentStorageSchema(config).safeParse({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'blockquote', content: [{ type: 'paragraph' }] }],
        },
      ],
    })

    expect(result.success).toBe(false)
  })

  test('rejects features disabled in the field config', () => {
    const result = createContentStorageSchema(editorOptionsToConfig({ heading: false })).safeParse({
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 1 } }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('heading nodes are disabled for this field')
    }
  })

  test('accepts custom nodes and marks with serialized props', () => {
    expect(
      createContentStorageSchema(config).safeParse({
        type: 'doc',
        content: [
          {
            type: 'callout',
            attrs: { props: { tone: 'info' } },
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Hello',
                    marks: [
                      {
                        type: 'highlight',
                        attrs: { props: { color: 'yellow' } },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }).success
    ).toBe(true)
  })

  test('rejects custom nodes without serialized props', () => {
    expect(
      createContentStorageSchema(config).safeParse({
        type: 'doc',
        content: [{ type: 'callout' }],
      }).success
    ).toBe(false)
  })
})
