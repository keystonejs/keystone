import { text } from '@keystone-next/fields';
import { document } from '@keystone-next/fields-document';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestRunner } from '@keystone-next/testing';
import { KeystoneContext } from '../../../../packages-next/types/src';
import { apiTestConfig } from '../../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
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
        fields: { name: text() },
        access: { read: { name_not: 'Charlie' } },
      }),
    }),
  }),
});

const initData = async ({ context }: { context: KeystoneContext }) => {
  const alice = await context.lists.Author.createOne({ data: { name: 'Alice' } });
  const bob = await context.lists.Author.createOne({ data: { name: 'Bob' } });
  const charlie = await context.lists.Author.createOne({ data: { name: 'Charlie' } });
  type T = { id: string; label?: string; data?: Record<string, any> } | null;
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
  ];
  const post = await context.lists.Post.createOne({ data: { content } });
  return { alice, bob, charlie, post, content };
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
      const { alice, bob, post, content } = await initData({ context });

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
      content[2].children[1].data = null;
      expect(_post.content.document).toEqual(content);
    })
  );

  test(
    'hydrateRelationships: true - dangling reference',
    runner(async ({ context }) => {
      const { alice, bob, post, content } = await initData({ context });
      await context.lists.Author.deleteOne({ id: bob.id });
      const _post = await context.lists.Post.findOne({
        where: { id: post.id },
        query: 'content { document(hydrateRelationships: true) }',
      });
      content[0].children[1].data = {
        id: alice.id,
        label: 'Alice',
        data: { id: alice.id, name: 'Alice' },
      };
      // We expect the `data` field of the relationship to be null
      content[1].children[1].data = null;
      // Access denied on charlie;
      content[2].children[1].data = null;
      expect(_post.content.document).toEqual(content);
    })
  );
});
