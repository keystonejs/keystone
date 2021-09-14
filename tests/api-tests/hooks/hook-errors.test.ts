import { text } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { GraphQLRequest, setupTestRunner } from '@keystone-next/keystone/testing';
import { KeystoneContext } from '@keystone-next/keystone/types';
import { apiTestConfig, expectExtensionError } from '../utils';

const runner = (debug: boolean | undefined) =>
  setupTestRunner({
    config: apiTestConfig({
      lists: {
        User: list({
          fields: { name: text({ isFilterable: true, isOrderable: true }) },
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
      },
      graphql: { debug },
    }),
  });

[true, false].map(useHttp => {
  const runQuery = async (
    context: KeystoneContext,
    graphQLRequest: GraphQLRequest,
    query: { query: string; variables?: Record<string, any> }
  ) => {
    if (useHttp) {
      const { body } = await graphQLRequest(query);
      return body;
    } else {
      return await context.graphql.raw(query);
    }
  };

  [true, false, undefined].map(debug => {
    (['dev', 'production'] as const).map(mode =>
      describe(`NODE_ENV=${mode}, debug=${debug} useHttp=${useHttp}`, () => {
        beforeAll(() => {
          // @ts-ignore
          process.env.NODE_ENV = mode;
        });
        afterAll(() => {
          // @ts-ignore
          process.env.NODE_ENV = 'test';
        });

        ['before', 'after'].map(phase => {
          describe(`List Hooks: ${phase}Change/${phase}Delete()`, () => {
            test(
              'createOne',
              runner(debug)(async ({ context, graphQLRequest }) => {
                // Valid name should pass
                await context.lists.User.createOne({ data: { name: 'good' } });

                // Trigger an error
                const { data, errors } = await runQuery(context, graphQLRequest, {
                  query: `mutation ($data: UserCreateInput!) { createUser(data: $data) { id } }`,
                  variables: { data: { name: `trigger ${phase}` } },
                });

                // Returns null and throws an error
                expect(data).toEqual({ createUser: null });
                const message = `Simulated error: ${phase}Change`;
                expectExtensionError(mode, useHttp, debug, errors, `${phase}Change`, [
                  {
                    path: ['createUser'],
                    messages: [`User: Simulated error: ${phase}Change`],
                    debug: [
                      {
                        message,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message}\n[^\n]*${phase}Change .${__filename}`)
                        ),
                      },
                    ],
                  },
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
              runner(debug)(async ({ context, graphQLRequest }) => {
                // Valid name should pass
                const user = await context.lists.User.createOne({ data: { name: 'good' } });
                await context.lists.User.updateOne({
                  where: { id: user.id },
                  data: { name: 'better' },
                });

                // Invalid name
                const { data, errors } = await runQuery(context, graphQLRequest, {
                  query: `mutation ($id: ID! $data: UserUpdateInput!) { updateUser(where: { id: $id }, data: $data) { id } }`,
                  variables: { id: user.id, data: { name: `trigger ${phase}` } },
                });

                // Returns null and throws an error
                expect(data).toEqual({ updateUser: null });
                const message = `Simulated error: ${phase}Change`;
                expectExtensionError(mode, useHttp, debug, errors, `${phase}Change`, [
                  {
                    path: ['updateUser'],
                    messages: [`User: ${message}`],
                    debug: [
                      {
                        message,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message}\n[^\n]*${phase}Change .${__filename}`)
                        ),
                      },
                    ],
                  },
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
              runner(debug)(async ({ context, graphQLRequest }) => {
                // Valid names should pass
                const user1 = await context.lists.User.createOne({ data: { name: 'good' } });
                const user2 = await context.lists.User.createOne({
                  data: { name: `trigger ${phase} delete` },
                });
                await context.lists.User.deleteOne({ where: { id: user1.id } });

                // Invalid name
                const { data, errors } = await runQuery(context, graphQLRequest, {
                  query: `mutation ($id: ID!) { deleteUser(where: { id: $id }) { id } }`,
                  variables: { id: user2.id },
                });

                // Returns null and throws an error
                expect(data).toEqual({ deleteUser: null });
                const message = `Simulated error: ${phase}Delete`;
                expectExtensionError(mode, useHttp, debug, errors, `${phase}Delete`, [
                  {
                    path: ['deleteUser'],
                    messages: [`User: ${message}`],
                    debug: [
                      {
                        message,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message}\n[^\n]*${phase}Delete .${__filename}`)
                        ),
                      },
                    ],
                  },
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
              runner(debug)(async ({ context, graphQLRequest }) => {
                // Mix of good and bad names
                const { data, errors } = await runQuery(context, graphQLRequest, {
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
                const message = `Simulated error: ${phase}Change`;
                expectExtensionError(mode, useHttp, debug, errors, `${phase}Change`, [
                  {
                    path: ['createUsers', 1],
                    messages: [`User: ${message}`],
                    debug: [
                      {
                        message,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message}\n[^\n]*${phase}Change .${__filename}`)
                        ),
                      },
                    ],
                  },
                  {
                    path: ['createUsers', 3],
                    messages: [`User: ${message}`],
                    debug: [
                      {
                        message,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message}\n[^\n]*${phase}Change .${__filename}`)
                        ),
                      },
                    ],
                  },
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
              runner(debug)(async ({ context, graphQLRequest }) => {
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
                const { data, errors } = await runQuery(context, graphQLRequest, {
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
                const message = `Simulated error: ${phase}Change`;
                expectExtensionError(mode, useHttp, debug, errors, `${phase}Change`, [
                  {
                    path: ['updateUsers', 1],
                    messages: [`User: ${message}`],
                    debug: [
                      {
                        message,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message}\n[^\n]*${phase}Change .${__filename}`)
                        ),
                      },
                    ],
                  },
                  {
                    path: ['updateUsers', 3],
                    messages: [`User: ${message}`],
                    debug: [
                      {
                        message,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message}\n[^\n]*${phase}Change .${__filename}`)
                        ),
                      },
                    ],
                  },
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
              runner(debug)(async ({ context, graphQLRequest }) => {
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
                const { data, errors } = await runQuery(context, graphQLRequest, {
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
                const message = `Simulated error: ${phase}Delete`;
                expectExtensionError(mode, useHttp, debug, errors, `${phase}Delete`, [
                  {
                    path: ['deleteUsers', 1],
                    messages: [`User: ${message}`],
                    debug: [
                      {
                        message,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message}\n[^\n]*${phase}Delete .${__filename}`)
                        ),
                      },
                    ],
                  },
                  {
                    path: ['deleteUsers', 3],
                    messages: [`User: ${message}`],
                    debug: [
                      {
                        message,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message}\n[^\n]*${phase}Delete .${__filename}`)
                        ),
                      },
                    ],
                  },
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
              runner(debug)(async ({ context, graphQLRequest }) => {
                const post = await context.lists.Post.createOne({
                  data: { title: 'original title', content: 'original content' },
                });

                const { data, errors } = await runQuery(context, graphQLRequest, {
                  query: `mutation ($id: ID! $data: PostUpdateInput!) { updatePost(where: { id: $id }, data: $data) { id } }`,
                  variables: {
                    id: post.id,
                    data: { title: `trigger ${phase}`, content: `trigger ${phase}` },
                  },
                });
                const message1 = `Simulated error: title: ${phase}Change`;
                const message2 = `Simulated error: content: ${phase}Change`;
                expectExtensionError(mode, useHttp, debug, errors, `${phase}Change`, [
                  {
                    path: ['updatePost'],
                    messages: [`Post.title: ${message1}`, `Post.content: ${message2}`],
                    debug: [
                      {
                        message: message1,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message1}\n[^\n]*${phase}Change .${__filename}`)
                        ),
                      },
                      {
                        message: message2,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message2}\n[^\n]*${phase}Change .${__filename}`)
                        ),
                      },
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
              `delete`,
              runner(debug)(async ({ context, graphQLRequest }) => {
                const post = await context.lists.Post.createOne({
                  data: { title: `trigger ${phase} delete`, content: `trigger ${phase} delete` },
                });
                const { data, errors } = await runQuery(context, graphQLRequest, {
                  query: `mutation ($id: ID!) { deletePost(where: { id: $id }) { id } }`,
                  variables: { id: post.id },
                });
                const message1 = `Simulated error: title: ${phase}Delete`;
                const message2 = `Simulated error: content: ${phase}Delete`;
                expectExtensionError(mode, useHttp, debug, errors, `${phase}Delete`, [
                  {
                    path: ['deletePost'],
                    messages: [`Post.title: ${message1}`, `Post.content: ${message2}`],
                    debug: [
                      {
                        message: message1,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message1}\n[^\n]*${phase}Delete .${__filename}`)
                        ),
                      },
                      {
                        message: message2,
                        stacktrace: expect.stringMatching(
                          new RegExp(`Error: ${message2}\n[^\n]*${phase}Delete .${__filename}`)
                        ),
                      },
                    ],
                  },
                ]);
                expect(data).toEqual({ deletePost: null });

                // Post should have its original data for 'before', and not exist for 'after'.
                const result = await runQuery(context, graphQLRequest, {
                  query: `query ($id: ID!) { post(where: { id: $id }) { title content} }`,
                  variables: { id: post.id },
                });
                if (phase === 'before') {
                  expect(result.errors).toBe(undefined);
                  expect(result.data).toEqual({
                    post: { title: 'trigger before delete', content: 'trigger before delete' },
                  });
                } else {
                  expect(result.errors).toBe(undefined);
                  expect(result.data).toEqual({ post: null });
                }
              })
            );
          });
        });
      })
    );
  });
});
