import assert from 'node:assert/strict'
import { test } from 'node:test'

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { checkbox, relationship, text } from '@keystone-6/core/fields'
import { setupTestSuite } from './utils.ts'

const suite = setupTestSuite({
  config: {
    lists: {
      Author: list({
        access: {
          operation: allowAll,
          filter: { query: () => ({ isPublic: { equals: true } }) },
        },
        fields: {
          name: text(),
          isPublic: checkbox(),
        },
      }),
      Post: list({
        access: allowAll,
        fields: {
          title: text(),
          author: relationship({ ref: 'Author' }),
        },
      }),
    },
  },
})

test('to-one author filters treat an inaccessible author as absent', async () => {
  const { context } = await suite()

  await context.sudo().db.Post.createMany({
    data: [
      {
        title: 'Public',
        author: { create: { name: 'Public Author', isPublic: true } },
      },
      {
        title: 'Hidden',
        author: { create: { name: 'Private Author', isPublic: false } },
      },
      { title: 'Unassigned' },
    ],
  })

  async function expectPosts(queries: string[], expected: { public: unknown[]; sudo: unknown[] }) {
    for (const query of queries) {
      const publicResult = await context.graphql.run({ query })
      assert.deepEqual(
        JSON.parse(JSON.stringify(publicResult)),
        { posts: expected.public },
        `Public response for ${query.trim()}`
      )

      const sudoResult = await context.sudo().graphql.run({ query })
      assert.deepEqual(
        JSON.parse(JSON.stringify(sudoResult)),
        { posts: expected.sudo },
        `Sudo response for ${query.trim()}`
      )
    }
  }

  await expectPosts(
    [
      `
        query CreatedPosts {
          posts(orderBy: { title: asc }) {
            title
            author {
              name
              isPublic
            }
          }
        }
      `,
    ],
    {
      public: [
        { title: 'Hidden', author: null },
        { title: 'Public', author: { name: 'Public Author', isPublic: true } },
        { title: 'Unassigned', author: null },
      ],
      sudo: [
        { title: 'Hidden', author: { name: 'Private Author', isPublic: false } },
        { title: 'Public', author: { name: 'Public Author', isPublic: true } },
        { title: 'Unassigned', author: null },
      ],
    }
  )

  await expectPosts(
    [
      `
        query WithoutReadableAuthor {
          posts(where: { author: null }, orderBy: { title: asc }) {
            title
          }
        }
      `,
      `
        query NotWithReadableAuthor {
          posts(where: { NOT: { author: {} } }, orderBy: { title: asc }) {
            title
          }
        }
      `,
    ],
    {
      public: [{ title: 'Hidden' }, { title: 'Unassigned' }],
      sudo: [{ title: 'Unassigned' }],
    }
  )

  await expectPosts(
    [
      `
        query WithReadableAuthor {
          posts(where: { author: {} }, orderBy: { title: asc }) {
            title
          }
        }
      `,
      `
        query NegatedNull {
          posts(where: { NOT: { author: null } }, orderBy: { title: asc }) {
            title
          }
        }
      `,
    ],
    {
      public: [{ title: 'Public' }],
      sudo: [{ title: 'Hidden' }, { title: 'Public' }],
    }
  )
})
