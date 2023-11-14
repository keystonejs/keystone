import { relationship, text } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { type KeystoneContext } from '@keystone-6/core/types'
import { allowAll } from '@keystone-6/core/access'
import { testConfig } from '../utils'
import { type GraphQLRequest, withServer } from '../with-server'

const runner = (debug: boolean | undefined) =>
  withServer(
    setupTestRunner({
      config: testConfig({
        lists: {
          User: list({
            access: allowAll,
            fields: { name: text() },
            hooks: {
              beforeOperation: ({ resolvedData, operation, item }) => {
                if (operation === 'delete') {
                  if (item.name === 'trigger before delete') {
                    throw new Error('Simulated error: beforeOperation')
                  }
                } else {
                  if (resolvedData?.name === 'trigger before') {
                    throw new Error('Simulated error: beforeOperation')
                  }
                }
              },
              afterOperation: ({ resolvedData, operation, originalItem }) => {
                if (operation === 'delete') {
                  if (originalItem.name === 'trigger after delete') {
                    throw new Error('Simulated error: afterOperation')
                  }
                } else {
                  if (resolvedData?.name === 'trigger after') {
                    throw new Error('Simulated error: afterOperation')
                  }
                }
              },
            },
          }),
          Post: list({
            access: allowAll,
            fields: {
              title: text({
                hooks: {
                  beforeOperation: ({ resolvedData, operation, item }) => {
                    if (operation === 'delete') {
                      if (item.title === 'trigger before delete') {
                        throw new Error('Simulated error: title: beforeOperation')
                      }
                    } else {
                      if (resolvedData?.title === 'trigger before') {
                        throw new Error('Simulated error: title: beforeOperation')
                      }
                    }
                  },
                  afterOperation: ({ resolvedData, operation, originalItem }) => {
                    if (operation === 'delete') {
                      if (originalItem.title === 'trigger after delete') {
                        throw new Error('Simulated error: title: afterOperation')
                      }
                    } else {
                      if (resolvedData?.title === 'trigger after') {
                        throw new Error('Simulated error: title: afterOperation')
                      }
                    }
                  },
                },
              }),
              content: text({
                hooks: {
                  beforeOperation: ({ resolvedData, operation, item }) => {
                    if (operation === 'delete') {
                      if (item.content === 'trigger before delete') {
                        throw new Error('Simulated error: content: beforeOperation')
                      }
                    } else {
                      if (resolvedData?.content === 'trigger before') {
                        throw new Error('Simulated error: content: beforeOperation')
                      }
                    }
                  },
                  afterOperation: ({ resolvedData, operation, originalItem }) => {
                    if (operation === 'delete') {
                      if (originalItem.content === 'trigger after delete') {
                        throw new Error('Simulated error: content: afterOperation')
                      }
                    } else {
                      if (resolvedData?.content === 'trigger after') {
                        throw new Error('Simulated error: content: afterOperation')
                      }
                    }
                  },
                },
              }),
            },
          }),
          BadResolveInput: list({
            access: allowAll,
            fields: {
              badResolveInput: relationship({
                ref: 'Post',
                hooks: {
                  resolveInput () {
                    return { blah: true }
                  },
                },
              }),
            },
          }),
        },
        graphql: { debug },
      }),
    })
  )

function stripStackTrace (errors: any[] = []) {
  for (const error of errors) {
    for (const e of error?.extensions?.debug ?? []) {
      delete e.stacktrace
    }
    delete error?.extensions.stacktrace
  }
  return errors
}

[true, false].map(useHttp => {
  const runQuery = async (
    context: KeystoneContext,
    graphQLRequest: GraphQLRequest,
    query: { query: string, variables?: Record<string, any> }
  ) => {
    if (useHttp) {
      const { body } = await graphQLRequest(query)
      return body
    } else {
      return await context.graphql.raw(query)
    }
  };

  [true, false, undefined].map(debug => {
    (['dev', 'production'] as const).map(mode =>
      describe(`NODE_ENV=${mode}, debug=${debug} useHttp=${useHttp}`, () => {
        beforeAll(() => {
          // @ts-expect-error
          process.env.NODE_ENV = mode
        })
        afterAll(() => {
          // @ts-expect-error
          process.env.NODE_ENV = 'test'
        });

        ['before', 'after'].map(phase => {
          describe(`List Hooks: ${phase}Operation`, () => {
            test(
              'createOne',
              runner(debug)(async ({ context, graphQLRequest }) => {
                // Valid name should pass
                await context.query.User.createOne({ data: { name: 'good' } })

                // Trigger an error
                const { data, errors } = await runQuery(context, graphQLRequest, {
                  query: `mutation ($data: UserCreateInput!) { createUser(data: $data) { id } }`,
                  variables: { data: { name: `trigger ${phase}` } },
                })

                // Returns null and throws an error
                expect(data).toEqual({ createUser: null })
                expect(stripStackTrace(errors)).toMatchSnapshot()

                // Only the original user should exist for 'before', both exist for 'after'
                const _users = await context.query.User.findMany({ query: 'id name' })
                expect(_users.map(({ name }) => name)).toEqual(
                  phase === 'before' ? ['good'] : ['good', 'trigger after']
                )
              })
            )

            test(
              'updateOne',
              runner(debug)(async ({ context, graphQLRequest }) => {
                // Valid name should pass
                const user = await context.query.User.createOne({ data: { name: 'good' } })
                await context.query.User.updateOne({
                  where: { id: user.id },
                  data: { name: 'better' },
                })

                // Invalid name
                const { data, errors } = await runQuery(context, graphQLRequest, {
                  query: `mutation ($id: ID! $data: UserUpdateInput!) { updateUser(where: { id: $id }, data: $data) { id } }`,
                  variables: { id: user.id, data: { name: `trigger ${phase}` } },
                })

                // Returns null and throws an error
                expect(data).toEqual({ updateUser: null })
                expect(stripStackTrace(errors)).toMatchSnapshot()

                // User should have its original name for 'before', and the new name for 'after'.
                const _users = await context.query.User.findMany({ query: 'id name' })
                expect(_users.map(({ name }) => name)).toEqual(
                  phase === 'before' ? ['better'] : ['trigger after']
                )
              })
            )

            test(
              'deleteOne',
              runner(debug)(async ({ context, graphQLRequest }) => {
                // Valid names should pass
                const user1 = await context.query.User.createOne({ data: { name: 'good' } })
                const user2 = await context.query.User.createOne({
                  data: { name: `trigger ${phase} delete` },
                })
                await context.query.User.deleteOne({ where: { id: user1.id } })

                // Invalid name
                const { data, errors } = await runQuery(context, graphQLRequest, {
                  query: `mutation ($id: ID!) { deleteUser(where: { id: $id }) { id } }`,
                  variables: { id: user2.id },
                })

                // Returns null and throws an error
                expect(data).toEqual({ deleteUser: null })
                expect(stripStackTrace(errors)).toMatchSnapshot()

                // Bad users should still be in the database for 'before', deleted for 'after'.
                const _users = await context.query.User.findMany({ query: 'id name' })
                expect(_users.map(({ name }) => name)).toEqual(
                  phase === 'before' ? ['trigger before delete'] : []
                )
              })
            )

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
                })

                // Valid users are returned, invalid come back as null
                expect(data).toEqual({
                  createUsers: [
                    { id: expect.any(String), name: 'good 1' },
                    null,
                    { id: expect.any(String), name: 'good 2' },
                    null,
                    { id: expect.any(String), name: 'good 3' },
                  ],
                })
                expect(stripStackTrace(errors)).toMatchSnapshot()

                // Three users should exist in the database for 'before,' five for 'after'.
                const users = await context.query.User.findMany({
                  orderBy: { name: 'asc' },
                  query: 'id name',
                })
                expect(users.map(({ name }) => name)).toEqual(
                  phase === 'before'
                    ? ['good 1', 'good 2', 'good 3']
                    : ['good 1', 'good 2', 'good 3', 'trigger after', 'trigger after']
                )
              })
            )

            test(
              'updateMany',
              runner(debug)(async ({ context, graphQLRequest }) => {
                // Start with some users
                const users = await context.query.User.createMany({
                  data: [
                    { name: 'good 1' },
                    { name: 'good 2' },
                    { name: 'good 3' },
                    { name: 'good 4' },
                    { name: 'good 5' },
                  ],
                  query: 'id name',
                })

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
                })

                // Valid users are returned, invalid come back as null
                expect(data).toEqual({
                  updateUsers: [
                    { id: users[0].id, name: 'still good 1' },
                    null,
                    { id: users[2].id, name: 'still good 3' },
                    null,
                  ],
                })
                expect(stripStackTrace(errors)).toMatchSnapshot()

                // All users should still exist in the database, un-changed for `before`, changed for `after`.
                const _users = await context.query.User.findMany({
                  orderBy: { name: 'asc' },
                  query: 'id name',
                })
                expect(_users.map(({ name }) => name)).toEqual(
                  phase === 'before'
                    ? ['good 2', 'good 4', 'good 5', 'still good 1', 'still good 3']
                    : ['good 5', 'still good 1', 'still good 3', 'trigger after', 'trigger after']
                )
              })
            )

            test(
              'deleteMany',
              runner(debug)(async ({ context, graphQLRequest }) => {
                // Start with some users
                const users = await context.query.User.createMany({
                  data: [
                    { name: 'good 1' },
                    { name: `trigger ${phase} delete` },
                    { name: 'good 3' },
                    { name: `trigger ${phase} delete` },
                    { name: 'good 5' },
                  ],
                  query: 'id name',
                })

                // Mix of good and bad names
                const { data, errors } = await runQuery(context, graphQLRequest, {
                  query: `mutation ($where: [UserWhereUniqueInput!]!) { deleteUsers(where: $where) { id name } }`,
                  variables: {
                    where: [users[0].id, users[1].id, users[2].id, users[3].id].map(id => ({ id })),
                  },
                })

                // Valid users are returned, invalid come back as null
                expect(data).toEqual({
                  deleteUsers: [
                    { id: users[0].id, name: 'good 1' },
                    null,
                    { id: users[2].id, name: 'good 3' },
                    null,
                  ],
                })
                expect(stripStackTrace(errors)).toMatchSnapshot()

                // Three users should still exist in the database for `before`, only 1 for `after`.
                const _users = await context.query.User.findMany({
                  orderBy: { name: 'asc' },
                  query: 'id name',
                })
                expect(_users.map(({ name }) => name)).toEqual(
                  phase === 'before'
                    ? ['good 5', 'trigger before delete', 'trigger before delete']
                    : ['good 5']
                )
              })
            )
          })
        });

        ['before', 'after'].map(phase => {
          describe(`Field Hooks: ${phase}Change()`, () => {
            test(
              'update',
              runner(debug)(async ({ context, graphQLRequest }) => {
                const post = await context.query.Post.createOne({
                  data: { title: 'original title', content: 'original content' },
                })

                const { data, errors } = await runQuery(context, graphQLRequest, {
                  query: `mutation ($id: ID! $data: PostUpdateInput!) { updatePost(where: { id: $id }, data: $data) { id } }`,
                  variables: {
                    id: post.id,
                    data: { title: `trigger ${phase}`, content: `trigger ${phase}` },
                  },
                })
                expect(data).toEqual({ updatePost: null })
                expect(stripStackTrace(errors)).toMatchSnapshot()

                // Post should have its original data for 'before', and the new data for 'after'.
                const _post = await context.query.Post.findOne({
                  where: { id: post.id },
                  query: 'title content',
                })
                expect(_post).toEqual(
                  phase === 'before'
                    ? { title: 'original title', content: 'original content' }
                    : { title: 'trigger after', content: 'trigger after' }
                )
              })
            )

            test(
              `delete`,
              runner(debug)(async ({ context, graphQLRequest }) => {
                const post = await context.query.Post.createOne({
                  data: { title: `trigger ${phase} delete`, content: `trigger ${phase} delete` },
                })
                const { data, errors } = await runQuery(context, graphQLRequest, {
                  query: `mutation ($id: ID!) { deletePost(where: { id: $id }) { id } }`,
                  variables: { id: post.id },
                })
                expect(data).toEqual({ deletePost: null })
                expect(stripStackTrace(errors)).toMatchSnapshot()

                // Post should have its original data for 'before', and not exist for 'after'.
                const result = await runQuery(context, graphQLRequest, {
                  query: `query ($id: ID!) { post(where: { id: $id }) { title content} }`,
                  variables: { id: post.id },
                })
                if (phase === 'before') {
                  expect(result.errors).toBe(undefined)
                  expect(result.data).toEqual({
                    post: { title: 'trigger before delete', content: 'trigger before delete' },
                  })
                } else {
                  expect(result.errors).toBe(undefined)
                  expect(result.data).toEqual({ post: null })
                }
              })
            )
          })
        })
      })
    )
  })
})

test(
  'bad resolve input',
  runner(true)(async ({ context }) => {
    const { data, errors } = await context.graphql.raw({
      query: `mutation { createBadResolveInput(data: {}) { id } }`,
    })
    expect(data).toEqual({ createBadResolveInput: null })
    expect(errors).toMatchSnapshot()
  })
)
