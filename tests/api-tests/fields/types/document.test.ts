import { text } from '@keystone-next/keystone/fields';
import { document } from '@keystone-next/fields-document';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import { KeystoneContext } from '@keystone-next/keystone/types';
import { apiTestConfig, expectInternalServerError } from '../../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Post: list({
        fields: {
          content: document({
            relationships: {
              mention: {
                kind: 'inline',
                listKey: 'Author',
                label: 'Mention',
                selection: 'id name',
              },
            },
          }),
        },
      }),
      Author: list({
        fields: {
          name: text({ isFilterable: true }),
          bio: document({
            relationships: {
              mention: {
                kind: 'inline',
                listKey: 'Author',
                label: 'Mention',
                // selection: INTENTIONALLY LEFT BLANK
              },
            },
          }),
          badBio: document({
            relationships: {
              mention: {
                kind: 'inline',
                listKey: 'Author',
                label: 'Mention',
                selection: 'bad selection',
              },
            },
          }),
        },
        access: { filter: { query: () => ({ name: { not: { equals: 'Charlie' } } }) } },
      }),
    },
  }),
});

const initData = async ({ context }: { context: KeystoneContext }) => {
  const alice = await context.lists.Author.createOne({ data: { name: 'Alice' } });
  const bob = await context.lists.Author.createOne({
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
  });
  const charlie = await context.lists.Author.createOne({ data: { name: 'Charlie' } });
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
  ];
  const dave = await context.lists.Author.createOne({ data: { name: 'Dave', bio } });
  type T = { id: string; label?: string; data?: Record<string, any> | null };
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
  ];
  const post = await context.lists.Post.createOne({ data: { content } });
  return { alice, bob, charlie, dave, post, content, bio };
};

describe('Document field type', () => {
  test(
    'hydrateRelationships default',
    runner(async ({ context }) => {
      const { post, content } = await initData({ context });

      const _post = await context.lists.Post.findOne({
        where: { id: post.id },
        query: 'content { document }',
      });
      expect(_post.content.document).toEqual(content);
    })
  );

  test(
    'hydrateRelationships: false',
    runner(async ({ context }) => {
      const { post, content } = await initData({ context });

      const _post = await context.lists.Post.findOne({
        where: { id: post.id },
        query: 'content { document(hydrateRelationships: false) }',
      });
      expect(_post.content.document).toEqual(content);
    })
  );

  test(
    'hydrateRelationships: true',
    runner(async ({ context }) => {
      const { alice, bob, charlie, post, content } = await initData({ context });

      const _post = await context.lists.Post.findOne({
        where: { id: post.id },
        query: 'content { document(hydrateRelationships: true) }',
      });
      content[0].children[1].data = {
        id: alice.id,
        label: 'Alice',
        data: { id: alice.id, name: 'Alice' },
      };
      content[1].children[1].data = { id: bob.id, label: 'Bob', data: { id: bob.id, name: 'Bob' } };
      // Access denied on charlie;
      content[2].children[1].data = { id: charlie.id };
      expect(_post.content.document).toEqual(content);
    })
  );

  test(
    'hydrateRelationships: true - dangling reference',
    runner(async ({ context }) => {
      const { alice, bob, charlie, post, content } = await initData({ context });
      await context.lists.Author.deleteOne({ where: { id: bob.id } });
      const _post = await context.lists.Post.findOne({
        where: { id: post.id },
        query: 'content { document(hydrateRelationships: true) }',
      });
      content[0].children[1].data = {
        id: alice.id,
        label: 'Alice',
        data: { id: alice.id, name: 'Alice' },
      };
      // We expect the `data` field of the relationship to be undefined
      content[1].children[1].data = { id: bob.id };
      // Access denied on charlie;
      content[2].children[1].data = { id: charlie.id };
      expect(_post.content.document).toEqual(content);
    })
  );

  test(
    'hydrateRelationships: true - selection undefined',
    runner(async ({ context }) => {
      const { alice, charlie, dave, bio } = await initData({ context });

      const _dave = await context.lists.Author.findOne({
        where: { id: dave.id },
        query: 'bio { document(hydrateRelationships: true) }',
      });

      // With no selection, we expect data to be an empty object
      bio[0].children[1].data = { id: alice.id, label: 'Alice', data: {} };
      // But still, and access-denied user will return data: undefined
      bio[1].children[1].data = { id: charlie.id };

      expect(_dave.bio.document).toEqual(bio);
    })
  );

  test(
    'hydrateRelationships: true - selection has bad fields',
    runner(async ({ context, graphQLRequest }) => {
      const { alice } = await initData({ context });
      const badBob = await context.lists.Author.createOne({
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
      });

      const { body } = await graphQLRequest({
        query:
          'query ($id: ID!){ author(where: { id: $id }) { badBio { document(hydrateRelationships: true) } } }',
        variables: { id: badBob.id },
      });
      // FIXME: The path doesn't match the null field here!
      expect(body.data).toEqual({ author: { badBio: null } });
      expectInternalServerError(body.errors, true, [
        {
          path: ['author', 'badBio', 'document'],
          message: 'Cannot query field "bad" on type "Author". Did you mean "bio" or "id"?',
        },
      ]);
    })
  );
});
