import { list } from '@keystone-6/core'
import { setupTestRunner } from '../test-runner'
import { allowAll } from '@keystone-6/core/access'
import { document } from '@keystone-6/fields-document'
import { component, fields } from '@keystone-6/fields-document/component-blocks'

const runner = setupTestRunner({
  config: {
    lists: {
      Post: list({
        access: allowAll,
        fields: {
          document: document({
            formatting: true,
            links: true,
            dividers: true,
            componentBlocks: {
              a: component({
                label: 'a',
                schema: {
                  url: fields.url({ label: 'url' }),
                },
                preview: () => null,
              }),
            },
          }),
        },
      }),
    },
  },
})

test(
  'large document structure',
  runner(async ({ context }) => {
    const content = Array.from({ length: 1000 }, (_, i) => ({
      type: 'paragraph',
      children: [
        {
          text: 'blah',
        },
        { type: 'link', href: 'https://example.com', children: [{ text: `blah ${i}` }] },
        { text: 'blah' },
      ],
    }))
    await context.query.Post.createOne({
      data: {
        document: content,
      },
    })
  })
)

test(
  'bad url',
  runner(async ({ context }) => {
    const content = [
      {
        type: 'paragraph',
        children: [
          {
            text: 'blah',
          },
          { type: 'link', href: 'javascript:evil', children: [{ text: `blah` }] },
          { text: 'blah' },
        ],
      },
    ]
    await expect(() =>
      context.query.Post.createOne({
        data: {
          document: content,
        },
      })
    ).rejects.toHaveProperty(
      'message',
      `An error occurred while resolving input fields.
  - Post.document: Invalid document structure: [
  {
    "code": "custom",
    "message": "Invalid URL: javascript:evil",
    "path": [
      0,
      "children",
      1,
      "href"
    ]
  }
]`
    )
  })
)

test(
  'bad url in component block',
  runner(async ({ context }) => {
    const content = [
      {
        type: 'component-block',
        component: 'a',
        props: {
          url: 'javascript:evil',
        },
        children: [
          {
            type: 'component-inline-prop',
            children: [{ text: '' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]
    await expect(() =>
      context.query.Post.createOne({
        data: {
          document: content,
        },
      })
    ).rejects.toHaveProperty(
      'message',
      `An error occurred while resolving input fields.
  - Post.document: Invalid form prop value: "javascript:evil" at url`
    )
  })
)
