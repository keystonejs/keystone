import { maybeCacheControlFromInfo } from '@apollo/cache-control-types'
import { text, relationship, integer } from '@keystone-6/core/fields'
import { list, graphql } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { type ContextFromRunner } from '../utils'

const runner = setupTestRunner({
  serve: true,
  config: {
    lists: {
      Post: list({
        access: allowAll,
        fields: {
          title: text(),
          author: relationship({ ref: 'User.posts', many: true }),
        },
        graphql: {
          cacheHint: { scope: 'PUBLIC', maxAge: 100 },
        },
      }),
      User: list({
        access: allowAll,
        fields: {
          name: text({ graphql: { cacheHint: { maxAge: 80 } } }),
          favNumber: integer({
            graphql: { cacheHint: { maxAge: 10, scope: 'PRIVATE' } },
          }),
          posts: relationship({ ref: 'Post.author', many: true }),
        },
        graphql: {
          cacheHint: ({ results, operationName, meta }) => {
            if (meta) {
              return { scope: 'PUBLIC', maxAge: 90 }
            }
            if (operationName === 'complexQuery') {
              return { maxAge: 1 }
            }
            if (results.length === 0) {
              return { maxAge: 5 }
            }
            return { maxAge: 100 }
          },
        },
      }),
    },
    graphql: {
      extendGraphqlSchema: graphql.extend(() => {
        const MyType = graphql.object<{ original: number }>()({
          name: 'MyType',
          fields: {
            original: graphql.field({ type: graphql.Int }),
            double: graphql.field({ type: graphql.Int, resolve: ({ original }) => original * 2 }),
          },
        })
        return {
          query: {
            double: graphql.field({
              type: MyType,
              args: { x: graphql.arg({ type: graphql.nonNull(graphql.Int) }) },
              resolve: (_, { x }, context, info) => {
                maybeCacheControlFromInfo(info)?.setCacheHint({ maxAge: 100, scope: 'PUBLIC' })
                return { original: x, double: x * 2 }
              },
            }),
          },
          mutation: {
            triple: graphql.field({
              type: graphql.Int,
              args: { x: graphql.arg({ type: graphql.nonNull(graphql.Int) }) },
              resolve: (_, { x }) => x * 3,
            }),
          },
        }
      }),
    }
  }
})

const addFixtures = async (context: ContextFromRunner<typeof runner>) => {
  const users = await context.query.User.createMany({
    data: [
      { name: 'Jess', favNumber: 1 },
      { name: 'Johanna', favNumber: 8 },
      { name: 'Sam', favNumber: 5 },
    ],
  })

  const posts = await context.query.Post.createMany({
    data: [
      { author: { connect: [{ id: users[0].id }] }, title: 'One author' },
      { author: { connect: [{ id: users[0].id }, { id: users[1].id }] }, title: 'Two authors' },
      {
        author: { connect: [{ id: users[0].id }, { id: users[1].id }, { id: users[2].id }] },
        title: 'Three authors',
      },
    ],
  })

  return { users, posts }
}

describe('cache hints', () => {
  test(
    'users',
    runner(async ({ context, gqlSuper }) => {
      await addFixtures(context)

      // Basic query
      const { body, headers } = await gqlSuper({
        query: `
          query {
            users {
              name
            }
          }
        `,
      })
      expect(body.data).toHaveProperty('users')
      expect(headers['cache-control']).toBe('max-age=80, public')

      // favNumber has the most restrictive hint
      {
        const { body, headers } = await gqlSuper({
          query: `
            query favNumbers {
              users {
                name
                favNumber
              }
            }
          `,
        })

        expect(body.data).toHaveProperty('users')
        expect(headers['cache-control']).toBe('max-age=10, private')
      }
      // Count query
      {
        const { body, headers } = await gqlSuper({
          query: `query { usersCount }`,
        })

        expect(body.data).toHaveProperty('usersCount')
        expect(headers['cache-control']).toBe('max-age=90, public')
      }
      // User post relationship
      {
        const { body, headers } = await gqlSuper({
          query: `
          query {
            users {
              posts {
                title
              }
            }
          }
        `,
        })

        expect(body.data).toHaveProperty('users')
        expect(headers['cache-control']).toBe('max-age=100, public')
      }
      // Operation name detected
      {
        const { body, headers } = await gqlSuper({
          query: `
          query complexQuery {
            users {
              name
            }
          }
        `,
        })

        expect(body.data).toHaveProperty('users')
        expect(headers['cache-control']).toBe('max-age=1, public')
      }
      // Hint based on query results
      {
        const { body, headers } = await gqlSuper({
          query: `
          query {
            users(where: { name: { equals: "nope" } })  {
              name
            }
          }
        `,
        })

        expect(body.data).toHaveProperty('users')
        expect(headers['cache-control']).toBe('max-age=5, public')
      }
    })
  )

  test(
    'posts',
    runner(async ({ context, gqlSuper }) => {
      await addFixtures(context)
      // The Post list has a static cache hint

      // Basic query
      {
        const { body, headers } = await gqlSuper({
          query: `
          query {
            posts {
              title
            }
          }
        `,
        })

        expect(body.data).toHaveProperty('posts')
        expect(headers['cache-control']).toBe('max-age=100, public')
      }

      // Hints on post authors are more restrictive
      {
        const { body, headers } = await gqlSuper({
          query: `
          query {
            posts {
              author {
                name
                favNumber
              }
            }
          }
        `,
        })

        expect(body.data).toHaveProperty('posts')
        expect(headers['cache-control']).toBe('max-age=10, private')
      }

      // Post author meta query
      {
        const { body, headers } = await gqlSuper({
          query: `
          query {
            posts {
              authorCount
            }
          }
        `,
        })

        expect(body.data).toHaveProperty('posts')
        expect(headers['cache-control']).toBe('max-age=90, public')
      }

      // Author subquery detects operation name
      {
        const { body, headers } = await gqlSuper({
          query: `
          query complexQuery {
            posts {
              author {
                name
              }
            }
          }
        `,
        })

        expect(body.data).toHaveProperty('posts')
        expect(headers['cache-control']).toBe('max-age=1, public')
      }
      // Post author query using cache hint dynamically caculated from results
      {
        const { body, headers } = await gqlSuper({
          query: `
          query {
            posts {
              author(where: { name: { equals: "nope" } }) {
                name
              }
            }
          }
        `,
        })

        expect(body.data).toHaveProperty('posts')
        expect(headers['cache-control']).toBe('max-age=5, public')
      }
    })
  )

  test(
    'mutations',
    runner(async ({ context, gqlSuper }) => {
      const { posts } = await addFixtures(context)

      // Mutation responses shouldn't be cached.
      // Here's a smoke test to make sure they still work.
      const { body } = await gqlSuper({
        query: `
          mutation {
            deletePost(where: { id: "${posts[0].id}" }) {
              id
            }
          }
        `,
      })

      expect(body.data).toHaveProperty('deletePost')
    })
  )

  test(
    'extendGraphQLSchemaQueries',
    runner(async ({ context, gqlSuper }) => {
      await addFixtures(context)

      const { body, headers } = await gqlSuper({
        query: `
          query {
            double(x: 2) {
              original
              double
            }
          }
        `,
      })

      expect(body.data).toHaveProperty('double')
      expect(headers['cache-control']).toBe('max-age=100, public')
    })
  )

  test(
    'extendGraphQLSchemaMutations',
    runner(async ({ context, gqlSuper }) => {
      await addFixtures(context)

      // Mutation responses shouldn't be cached.
      // Here's a smoke test to make sure they still work.
      const { body } = await gqlSuper({
        query: `
          mutation {
            triple(x: 3)
          }
        `,
      })

      expect(body.data).toHaveProperty('triple')
    })
  )
})
