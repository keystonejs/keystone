import { list } from '@keystone-6/core'
import { setupTestRunner } from '../test-runner'
import { allowAll } from '@keystone-6/core/access'
import { document } from '@keystone-6/fields-document'

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
