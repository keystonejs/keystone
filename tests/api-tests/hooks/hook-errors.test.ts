import { text } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { setupTestRunner } from '@keystone-next/testing';
import { apiTestConfig, expectAccessDenied, expectExtensionError } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: createSchema({
      User: list({
        fields: { name: text() },
        hooks: {
          beforeChange: ({ resolvedData }) => {
            if (resolvedData.name === 'trigger before') {
              throw new Error('Simulated error: beforeChange');
            }
          },
          afterChange: ({ resolvedData }) => {
            if (resolvedData.name === 'trigger after') {
              throw new Error('Simulated error: afterChange');
            }
          },
          beforeDelete: ({ existingItem }) => {
            if (existingItem.name === 'trigger before delete') {
              throw new Error('Simulated error: beforeDelete');
            }
          },
          afterDelete: ({ existingItem }) => {
            if (existingItem.name === 'trigger after delete') {
              throw new Error('Simulated error: afterDelete');
            }
          },
        },
      }),
      Post: list({
        fields: {
          title: text({
            hooks: {
              beforeChange: ({ resolvedData }) => {
                if (resolvedData.title === 'trigger before') {
                  throw new Error('Simulated error: title: beforeChange');
                }
              },
              afterChange: ({ resolvedData }) => {
                if (resolvedData.title === 'trigger after') {
                  throw new Error('Simulated error: title: afterChange');
                }
              },
              beforeDelete: ({ existingItem }) => {
                if (existingItem.title === 'trigger before delete') {
                  throw new Error('Simulated error: title: beforeDelete');
                }
              },
              afterDelete: ({ existingItem }) => {
                if (existingItem.title === 'trigger after delete') {
                  throw new Error('Simulated error: title: afterDelete');
                }
              },
            },
          }),
          content: text({
            hooks: {
              beforeChange: ({ resolvedData }) => {
                if (resolvedData.content === 'trigger before') {
                  throw new Error('Simulated error: content: beforeChange');
                }
              },
              afterChange: ({ resolvedData }) => {
                if (resolvedData.content === 'trigger after') {
                  throw new Error('Simulated error: content: afterChange');
                }
              },
              beforeDelete: ({ existingItem }) => {
                if (existingItem.content === 'trigger before delete') {
                  throw new Error('Simulated error: content: beforeDelete');
                }
              },
              afterDelete: ({ existingItem }) => {
                if (existingItem.content === 'trigger after delete') {
                  throw new Error('Simulated error: content: afterDelete');
                }
              },
            },
          }),
        },
      }),
    }),
  }),
});

['before', 'after'].map(phase => {
  describe(`List Hooks: ${phase}Change/${phase}Delete()`, () => {
    test(
      'createOne',
      runner(async ({ context }) => {
        // Valid name should pass
        await context.lists.User.createOne({ data: { name: 'good' } });

        // Trigger an error
        const { data, errors } = await context.graphql.raw({
          query: `mutation ($data: UserCreateInput!) { createUser(data: $data) { id } }`,
          variables: { data: { name: `trigger ${phase}` } },
        });

        // Returns null and throws an error
        expect(data).toEqual({ createUser: null });
        expectExtensionError(errors, `${phase}Change`, [
          { path: ['createUser'], messages: [`User: Simulated error: ${phase}Change`] },
        ]);

        // Only the original user should exist for 'before', both exist for 'after'
        const _users = await context.lists.User.findMany({ query: 'id name' });
        expect(_users.map(({ name }) => name)).toEqual(
          phase === 'before' ? ['good'] : ['good', 'trigger after']
        );
      })
    );

    test(
      'updateOne',
      runner(async ({ context }) => {
        // Valid name should pass
        const user = await context.lists.User.createOne({ data: { name: 'good' } });
        await context.lists.User.updateOne({ where: { id: user.id }, data: { name: 'better' } });

        // Invalid name
        const { data, errors } = await context.graphql.raw({
          query: `mutation ($id: ID! $data: UserUpdateInput!) { updateUser(where: { id: $id }, data: $data) { id } }`,
          variables: { id: user.id, data: { name: `trigger ${phase}` } },
        });

        // Returns null and throws an error
        expect(data).toEqual({ updateUser: null });
        expectExtensionError(errors, `${phase}Change`, [
          { path: ['updateUser'], messages: [`User: Simulated error: ${phase}Change`] },
        ]);

        // User should have its original name for 'before', and the new name for 'after'.
        const _users = await context.lists.User.findMany({ query: 'id name' });
        expect(_users.map(({ name }) => name)).toEqual(
          phase === 'before' ? ['better'] : ['trigger after']
        );
      })
    );

    test(
      'deleteOne',
      runner(async ({ context }) => {
        // Valid names should pass
        const user1 = await context.lists.User.createOne({ data: { name: 'good' } });
        const user2 = await context.lists.User.createOne({
          data: { name: `trigger ${phase} delete` },
        });
        await context.lists.User.deleteOne({ where: { id: user1.id } });

        // Invalid name
        const { data, errors } = await context.graphql.raw({
          query: `mutation ($id: ID!) { deleteUser(where: { id: $id }) { id } }`,
          variables: { id: user2.id },
        });

        // Returns null and throws an error
        expect(data).toEqual({ deleteUser: null });
        expectExtensionError(errors, `${phase}Delete`, [
          { path: ['deleteUser'], messages: [`User: Simulated error: ${phase}Delete`] },
        ]);

        // Bad users should still be in the database for 'before', deleted for 'after'.
        const _users = await context.lists.User.findMany({ query: 'id name' });
        expect(_users.map(({ name }) => name)).toEqual(
          phase === 'before' ? ['trigger before delete'] : []
        );
      })
    );

    test(
      'createMany',
      runner(async ({ context }) => {
        // Mix of good and bad names
        const { data, errors } = await context.graphql.raw({
          query: `mutation ($data: [UserCreateInput!]!) { createUsers(data: $data) { id name } }`,
          variables: {
            data: [
              { name: 'good 1' },
              { name: `trigger ${phase}` },
              { name: 'good 2' },
              { name: `trigger ${phase}` },
              { name: 'good 3' },
            ],
          },
        });

        // Valid users are returned, invalid come back as null
        expect(data).toEqual({
          createUsers: [
            { id: expect.any(String), name: 'good 1' },
            null,
            { id: expect.any(String), name: 'good 2' },
            null,
            { id: expect.any(String), name: 'good 3' },
          ],
        });
        // The invalid creates should have errors which point to the nulls in their path
        expectExtensionError(errors, `${phase}Change`, [
          { path: ['createUsers', 1], messages: [`User: Simulated error: ${phase}Change`] },
          { path: ['createUsers', 3], messages: [`User: Simulated error: ${phase}Change`] },
        ]);

        // Three users should exist in the database for 'before,' five for 'after'.
        const users = await context.lists.User.findMany({
          orderBy: { name: 'asc' },
          query: 'id name',
        });
        expect(users.map(({ name }) => name)).toEqual(
          phase === 'before'
            ? ['good 1', 'good 2', 'good 3']
            : ['good 1', 'good 2', 'good 3', 'trigger after', 'trigger after']
        );
      })
    );

    test(
      'updateMany',
      runner(async ({ context }) => {
        // Start with some users
        const users = await context.lists.User.createMany({
          data: [
            { name: 'good 1' },
            { name: 'good 2' },
            { name: 'good 3' },
            { name: 'good 4' },
            { name: 'good 5' },
          ],
          query: 'id name',
        });

        // Mix of good and bad names
        const { data, errors } = await context.graphql.raw({
          query: `mutation ($data: [UserUpdateArgs!]!) { updateUsers(data: $data) { id name } }`,
          variables: {
            data: [
              { where: { id: users[0].id }, data: { name: 'still good 1' } },
              { where: { id: users[1].id }, data: { name: `trigger ${phase}` } },
              { where: { id: users[2].id }, data: { name: 'still good 3' } },
              { where: { id: users[3].id }, data: { name: `trigger ${phase}` } },
            ],
          },
        });

        // Valid users are returned, invalid come back as null
        expect(data).toEqual({
          updateUsers: [
            { id: users[0].id, name: 'still good 1' },
            null,
            { id: users[2].id, name: 'still good 3' },
            null,
          ],
        });
        // The invalid updates should have errors which point to the nulls in their path
        expectExtensionError(errors, `${phase}Change`, [
          { path: ['updateUsers', 1], messages: [`User: Simulated error: ${phase}Change`] },
          { path: ['updateUsers', 3], messages: [`User: Simulated error: ${phase}Change`] },
        ]);

        // All users should still exist in the database, un-changed for `before`, changed for `after`.
        const _users = await context.lists.User.findMany({
          orderBy: { name: 'asc' },
          query: 'id name',
        });
        expect(_users.map(({ name }) => name)).toEqual(
          phase === 'before'
            ? ['good 2', 'good 4', 'good 5', 'still good 1', 'still good 3']
            : ['good 5', 'still good 1', 'still good 3', 'trigger after', 'trigger after']
        );
      })
    );

    test(
      'deleteMany',
      runner(async ({ context }) => {
        // Start with some users
        const users = await context.lists.User.createMany({
          data: [
            { name: 'good 1' },
            { name: `trigger ${phase} delete` },
            { name: 'good 3' },
            { name: `trigger ${phase} delete` },
            { name: 'good 5' },
          ],
          query: 'id name',
        });

        // Mix of good and bad names
        const { data, errors } = await context.graphql.raw({
          query: `mutation ($where: [UserWhereUniqueInput!]!) { deleteUsers(where: $where) { id name } }`,
          variables: {
            where: [users[0].id, users[1].id, users[2].id, users[3].id].map(id => ({ id })),
          },
        });

        // Valid users are returned, invalid come back as null
        expect(data).toEqual({
          deleteUsers: [
            { id: users[0].id, name: 'good 1' },
            null,
            { id: users[2].id, name: 'good 3' },
            null,
          ],
        });
        // The invalid deletes should have errors which point to the nulls in their path
        expectExtensionError(errors, `${phase}Delete`, [
          { path: ['deleteUsers', 1], messages: [`User: Simulated error: ${phase}Delete`] },
          { path: ['deleteUsers', 3], messages: [`User: Simulated error: ${phase}Delete`] },
        ]);

        // Three users should still exist in the database for `before`, only 1 for `after`.
        const _users = await context.lists.User.findMany({
          orderBy: { name: 'asc' },
          query: 'id name',
        });
        expect(_users.map(({ name }) => name)).toEqual(
          phase === 'before'
            ? ['good 5', 'trigger before delete', 'trigger before delete']
            : ['good 5']
        );
      })
    );
  });
});

['before', 'after'].map(phase => {
  describe(`Field Hooks: ${phase}Change/${phase}Delete()`, () => {
    test(
      'update',
      runner(async ({ context }) => {
        const post = await context.lists.Post.createOne({
          data: { title: 'original title', content: 'original content' },
        });

        const { data, errors } = await context.graphql.raw({
          query: `mutation ($id: ID! $data: PostUpdateInput!) { updatePost(where: { id: $id }, data: $data) { id } }`,
          variables: {
            id: post.id,
            data: { title: `trigger ${phase}`, content: `trigger ${phase}` },
          },
        });
        expectExtensionError(errors, `${phase}Change`, [
          {
            path: ['updatePost'],
            messages: [
              `Post.title: Simulated error: title: ${phase}Change`,
              `Post.content: Simulated error: content: ${phase}Change`,
            ],
          },
        ]);
        expect(data).toEqual({ updatePost: null });

        // Post should have its original data for 'before', and the new data for 'after'.
        const _post = await context.lists.Post.findOne({
          where: { id: post.id },
          query: 'title content',
        });
        expect(_post).toEqual(
          phase === 'before'
            ? { title: 'original title', content: 'original content' }
            : { title: 'trigger after', content: 'trigger after' }
        );
      })
    );

    test(
      'delete',
      runner(async ({ context }) => {
        const post = await context.lists.Post.createOne({
          data: { title: `trigger ${phase} delete`, content: `trigger ${phase} delete` },
        });
        const { data, errors } = await context.graphql.raw({
          query: `mutation ($id: ID!) { deletePost(where: { id: $id }) { id } }`,
          variables: { id: post.id },
        });
        expectExtensionError(errors, `${phase}Delete`, [
          {
            path: ['deletePost'],
            messages: [
              `Post.title: Simulated error: title: ${phase}Delete`,
              `Post.content: Simulated error: content: ${phase}Delete`,
            ],
          },
        ]);
        expect(data).toEqual({ deletePost: null });

        // Post should have its original data for 'before', and not exist for 'after'.
        const result = await context.graphql.raw({
          query: `query ($id: ID!) { post(where: { id: $id }) { title content} }`,
          variables: { id: post.id },
        });
        if (phase === 'before') {
          expect(result.errors).toBe(undefined);
          expect(result.data).toEqual({
            post: { title: 'trigger before delete', content: 'trigger before delete' },
          });
        } else {
          expectAccessDenied(result.errors, [{ path: ['post'] }]);
          expect(result.data).toEqual({ post: null });
        }
      })
    );
  });
});
