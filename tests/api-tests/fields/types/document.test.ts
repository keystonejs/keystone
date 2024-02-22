import { text } from '@keystone-6/core/fields'
import { document } from '@keystone-6/fields-document'
import { list } from '@keystone-6/core'
import { component, fields } from '@keystone-6/fields-document/component-blocks'
import { allowAll } from '@keystone-6/core/access'

import { setupTestEnv, setupTestRunner } from '../../test-runner'
import { type ContextFromRunner, expectInternalServerError } from '../../utils'

const runner = setupTestRunner({
  serve: true,
  config: ({
    lists: {
      Post: list({
        access: allowAll,
        fields: {
          content: document({
            relationships: {
              mention: {
                listKey: 'Author',
                label: 'Mention',
                selection: 'id name',
              },
            },
          }),
        },
      }),
      Author: list({
        access: {
          operation: allowAll,
          filter: { query: () => ({ name: { not: { equals: 'Charlie' } } }) },
        },
        fields: {
          name: text(),
          bio: document({
            relationships: {
              mention: {
                listKey: 'Author',
                label: 'Mention',
                // selection: INTENTIONALLY LEFT BLANK
              },
            },
          }),
          badBio: document({
            relationships: {
              mention: {
                listKey: 'Author',
                label: 'Mention',
                selection: 'bad selection',
              },
            },
          }),
        },
      }),
    },
  }),
})

const initData = async ({ context }: { context: ContextFromRunner<typeof runner> }) => {
  const alice = await context.query.Author.createOne({ data: { name: 'Alice' } })
  const bob = await context.query.Author.createOne({
    data: {
      name: 'Bob',
      bio: [
        {
          type: 'paragraph',
          children: [
            { text: '' },
            {
              type: 'relationship',
              data: { id: alice.id } as T,
              relationship: 'mention',
              children: [{ text: '' }],
            },
            { text: '' },
          ],
        },
      ],
    },
  })
  const charlie = await context.query.Author.createOne({ data: { name: 'Charlie' } })
  const bio = [
    {
      type: 'paragraph',
      children: [
        { text: '' },
        {
          type: 'relationship',
          data: { id: alice.id } as T,
          relationship: 'mention',
          children: [{ text: '' }],
        },
        { text: '' },
      ],
    },
    {
      type: 'paragraph',
      children: [
        { text: '' },
        {
          type: 'relationship',
          data: { id: charlie.id } as T,
          relationship: 'mention',
          children: [{ text: '' }],
        },
        { text: '' },
      ],
    },
  ]
  const dave = await context.query.Author.createOne({ data: { name: 'Dave', bio } })
  type T = { id: string, label?: string, data?: Record<string, any> | null }
  const content = [
    {
      type: 'paragraph',
      children: [
        { text: '' },
        {
          type: 'relationship',
          data: { id: alice.id } as T,
          relationship: 'mention',
          children: [{ text: '' }],
        },
        { text: '' },
      ],
    },
    {
      type: 'paragraph',
      children: [
        { text: '' },
        {
          type: 'relationship',
          data: { id: bob.id } as T,
          relationship: 'mention',
          children: [{ text: '' }],
        },
        { text: '' },
      ],
    },
    {
      type: 'paragraph',
      children: [
        { text: '' },
        {
          type: 'relationship',
          data: { id: charlie.id } as T,
          relationship: 'mention',
          children: [{ text: '' }],
        },
        { text: '' },
      ],
    },
    {
      type: 'paragraph',
      children: [
        { text: '' },
        {
          type: 'relationship',
          data: null,
          relationship: 'mention',
          children: [{ text: '' }],
        },
        { text: '' },
      ],
    },
  ]
  const post = await context.query.Post.createOne({ data: { content } })
  return { alice, bob, charlie, dave, post, content, bio }
}

describe('Document field type', () => {
  test(
    'hydrateRelationships default',
    runner(async ({ context }) => {
      const { post, content } = await initData({ context })

      const _post = await context.query.Post.findOne({
        where: { id: post.id },
        query: 'content { document }',
      })
      expect(_post.content.document).toEqual(content)
    })
  )

  test(
    'hydrateRelationships: false',
    runner(async ({ context }) => {
      const { post, content } = await initData({ context })

      const _post = await context.query.Post.findOne({
        where: { id: post.id },
        query: 'content { document(hydrateRelationships: false) }',
      })
      expect(_post.content.document).toEqual(content)
    })
  )

  test(
    'hydrateRelationships: true',
    runner(async ({ context }) => {
      const { alice, bob, charlie, post, content } = await initData({ context })

      const _post = await context.query.Post.findOne({
        where: { id: post.id },
        query: 'content { document(hydrateRelationships: true) }',
      })
      content[0].children[1].data = {
        id: alice.id,
        label: 'Alice',
        data: { id: alice.id, name: 'Alice' },
      }
      content[1].children[1].data = { id: bob.id, label: 'Bob', data: { id: bob.id, name: 'Bob' } }
      // Access denied on charlie;
      content[2].children[1].data = { id: charlie.id }
      expect(_post.content.document).toEqual(content)
    })
  )

  test(
    'hydrateRelationships: true - dangling reference',
    runner(async ({ context }) => {
      const { alice, bob, charlie, post, content } = await initData({ context })
      await context.query.Author.deleteOne({ where: { id: bob.id } })
      const _post = await context.query.Post.findOne({
        where: { id: post.id },
        query: 'content { document(hydrateRelationships: true) }',
      })
      content[0].children[1].data = {
        id: alice.id,
        label: 'Alice',
        data: { id: alice.id, name: 'Alice' },
      }
      // We expect the `data` field of the relationship to be undefined
      content[1].children[1].data = { id: bob.id }
      // Access denied on charlie;
      content[2].children[1].data = { id: charlie.id }
      expect(_post.content.document).toEqual(content)
    })
  )

  test(
    'hydrateRelationships: true - selection undefined',
    runner(async ({ context }) => {
      const { alice, charlie, dave, bio } = await initData({ context })

      const _dave = await context.query.Author.findOne({
        where: { id: dave.id },
        query: 'bio { document(hydrateRelationships: true) }',
      })

      // With no selection, we expect data to be an empty object
      bio[0].children[1].data = { id: alice.id, label: 'Alice', data: {} }
      // But still, and access-denied user will return data: undefined
      bio[1].children[1].data = { id: charlie.id }

      expect(_dave.bio.document).toEqual(bio)
    })
  )

  test(
    'hydrateRelationships: true - selection has bad fields',
    runner(async ({ context, gqlSuper }) => {
      const { alice } = await initData({ context })
      const badBob = await context.query.Author.createOne({
        data: {
          name: 'Bob',
          badBio: [
            {
              type: 'paragraph',
              children: [
                { text: '' },
                {
                  type: 'relationship',
                  data: { id: alice.id },
                  relationship: 'mention',
                  children: [{ text: '' }],
                },
                { text: '' },
              ],
            },
          ],
        },
      })

      const { body } = await gqlSuper({
        query:
          'query ($id: ID!){ author(where: { id: $id }) { badBio { document(hydrateRelationships: true) } } }',
        variables: { id: badBob.id },
      })
      // FIXME: The path doesn't match the null field here!
      expect(body.data).toEqual({ author: { badBio: null } })
      expectInternalServerError(body.errors, [
        {
          path: ['author', 'badBio', 'document'],
          message: 'Cannot query field "bad" on type "Author". Did you mean "bio" or "id"?',
        },
      ])
    })
  )
  test("an inline relationship to a list that doesn't exist throws an error", async () => {
    await expect(
      setupTestEnv({
        config: ({
          lists: {
            Post: list({
              access: allowAll,
              fields: {
                content: document({
                  relationships: {
                    mention: {
                      listKey: 'Author',
                      label: 'Mention',
                      selection: 'id name',
                    },
                  },
                }),
              },
            }),
          },
        }),
      })
    ).rejects.toMatchInlineSnapshot(
      `[Error: An inline relationship Mention (mention) in the field at Post.content has listKey set to "Author" but no list named "Author" exists.]`
    )
  })
  test("an relationship on a component block prop to a list that doesn't exist throws an error", async () => {
    await expect(
      setupTestEnv({
        config: ({
          lists: {
            Post: list({
              access: allowAll,
              fields: {
                content: document({
                  componentBlocks: {
                    someBlock: component({
                      preview: () => null,
                      label: 'Some Block',
                      schema: {
                        something: fields.object({
                          blah: fields.conditional(fields.checkbox({ label: 'Some conditional' }), {
                            false: fields.empty(),
                            true: fields.relationship({
                              label: 'Some Relationship',
                              listKey: 'Author',
                            }),
                          }),
                        }),
                      },
                    }),
                  },
                }),
              },
            }),
          },
        }),
      })
    ).rejects.toMatchInlineSnapshot(
      `[Error: Component block someBlock in Post.content: The relationship field at "object.something.object.blah.conditional.true" has the listKey "Author" but no list named "Author" exists.]`
    )
  })
})
