import { text, integer, relationship } from '@keystone-6/core/fields'
import { list } from '@keystone-6/core'
import { setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'
import { expectGraphQLValidationError } from '../utils'
import { depthLimit, definitionLimit, fieldLimit } from './validation'

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
          maxTake: 3,
        },
      }),
      User: list({
        access: allowAll,
        fields: {
          name: text(),
          favNumber: integer(),
          posts: relationship({ ref: 'Post.author', many: true }),
        },
      }),
    },
    graphql: {
      apolloConfig: {
        validationRules: [depthLimit(3), definitionLimit(3), fieldLimit(8)],
      },
    },
  },
})

describe('graphql.maxTake', () => {
  test('uses the default when querying', runner(async ({ context, gql }) => {
    await context.db.Post.createMany({
      data: [
        {
          title: 'Hello',
        },
        {
          title: 'World',
        },
      ],
    })

    const body = await gql({
      query: `
        query {
          posts {
            title
          }
        }
      `,
    })

    expect(body.data.posts.length).toEqual(2)
  }))

  test('enforces the default', runner(async ({ gql }) => {
    const { errors } = await gql({
      query: `
        query {
          posts(take: 5) {
            id
          }
        }
      `,
    })

    expect(errors).toMatchSnapshot()
  }))
})

// FIXME: we need upstream support in the graphql package to make KS validation rules work for internal requests
// (Low priority, but makes the API less surprising if rules work everywhere by default.)

describe('maximum depth limit', () => {
  test('nested query', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      query: `
        query {
          posts {
            author {
              posts {
                author {
                  name
                }
              }
            }
          }
        }
      `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [{ message: 'Operation has depth 5 (max: 3)' }])
  }))

  test('nested mutation', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      query: `
        mutation {
          updatePost(where: { id: "foo" }, data: { title: "bar" }) {
            author {
              posts {
                author {
                  name
                }
              }
            }
          }
        }
      `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [{ message: 'Operation has depth 5 (max: 3)' }])
  }))

  test('nested query (1 fragment)', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      query: `
      query nestingbomb {
        posts {
          ...f
        }
      }
      fragment f on Post {
        author {
          posts {
            title
          }
        }
      }
      `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [{ message: 'Operation has depth 4 (max: 3)' }])
  }))

  test('nested query (3 fragments)', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      query: `
      query nestingbomb {
        posts {
          ...f1
        }
      }
      fragment f1 on Post {
        author {
          ...f2
        }
      }
      fragment f2 on User {
        posts {
          title
        }
      }
      `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [{ message: 'Operation has depth 4 (max: 3)' }])
  }))

  // disallowed by GraphQL, but needs to be handled
  test('circular fragments', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      query: `
      query nestingbomb {
        posts {
          ...f1
        }
      }
      fragment f1 on Post {
        author {
          ...f2
        }
      }
      fragment f2 on User {
        posts {
          ...f1
        }
      }
      `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [
      { message: 'Operation has depth Infinity (max: 3)' },
      { message: 'Operation has depth Infinity (max: 3)' },
      { message: 'Operation has depth Infinity (max: 3)' },
      { message: 'Request contains Infinity fields (max: 8)' },
      { message: 'Cannot spread fragment "f1" within itself via "f2".' },
    ])
  }))

  // disallowed by GraphQL, but needs to be handled
  test('undefined fragment', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      query: `
      query {
        posts {
          ...nosuchfragment
        }
      }
      `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [
      { message: 'Undefined fragment "nosuchfragment"' },
      { message: 'Undefined fragment "nosuchfragment"' },
      { message: 'Unknown fragment "nosuchfragment".' },
    ])
  }))
})

describe('maximum definitions limit', () => {
  test('too many queries', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      operationName: 'a',
      query: `
          query a {
            posts {
              title
            }
          }
          query b {
            posts {
              title
            }
          }
          query c {
            posts {
              title
            }
          }
          query d {
            posts {
              title
            }
          }
        `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [{ message: 'Request contains 4 definitions (max: 3)' }])
  }))

  test('too many fragments', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      operationName: 'q1',
      query: `
          fragment f1 on Post {
            title
          }
          fragment f2 on Post {
            title
          }
          query q1 {
            posts {
              ...f1
            }
          }
          query q2 {
            posts {
              ...f2
            }
          }
        `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [
      { message: 'Request contains 4 definitions (max: 3)' },
    ])
  }))

  test('too many mutations', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      operationName: 'm1',
      query: `
      mutation m1 {
        updatePost(where: { id: "foo" }, data: { title: "bar" }) {
          title
        }
      }
      mutation m2 {
        updatePost(where: { id: "foo" }, data: { title: "bar" }) {
          title
        }
      }
      mutation m3 {
        updatePost(where: { id: "foo" }, data: { title: "bar" }) {
          title
        }
      }
      mutation m4 {
        updatePost(where: { id: "foo" }, data: { title: "bar" }) {
          title
        }
      }
    `,
    }).expect(400)

    // this isn't the only error, but that's okay
    expectGraphQLValidationError(body.errors, [
      { message: 'Request contains 4 definitions (max: 3)' },
    ])
  }))
})

describe('maximum fields limit', () => {
  test('one operation', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      query: `
          query {
            posts {
              title
              author {
                name
                favNumber
              }
            }
            users {
              name
              favNumber
              posts {
                title
              }
            }
          }
        `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [
      { message: 'Request contains 10 fields (max: 8)' },
    ])
  }))

  test('many operations', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      operationName: 'a',
      query: `
      query a {
        posts {
          title
        }
        users {
          name
        }
      }
      query b {
        posts {
          title
        }
        users {
          name
        }
      }
      query c {
        posts {
          title
        }
      }
    `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [
      { message: 'Request contains 10 fields (max: 8)' },
    ])
  }))

  test('fragments', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      operationName: 'a',
      query: `
          fragment f on User {
            name
            favNumber
          }
          query a {
            posts {
              title
              author {
                ...f
              }
            }
            users1: users {
              ...f
            }
            users2: users {
              ...f
            }
          }
        `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [
      { message: 'Request contains 11 fields (max: 8)' },
    ])
  }))

  test('unused fragment', runner(async ({ gqlSuper }) => {
    const { body } = await gqlSuper({
      operationName: 'a',
      query: `
          fragment unused on User {
            name
            favNumber
          }
          fragment f on User {
            name
            favNumber
          }
          query a {
            posts {
              title
              author {
                ...f
              }
            }
            users1: users {
              ...f
            }
            users2: users {
              ...f
            }
          }
        `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [
      { message: 'Request contains 13 fields (max: 8)' },
      { message: 'Fragment "unused" is never used.' },
    ])
  }))

  test('billion laughs', runner(async ({ gqlSuper }) => {
    // https://en.wikipedia.org/wiki/Billion_laughs
    const { body } = await gqlSuper({
      operationName: 'a',
      query: `
          query a {
            u1: users {
              ...lol1
            }
            u2: users {
              ...lol1
            }
            u3: users {
              ...lol1
            }
            u4: users {
              ...lol1
            }
            u5: users {
              ...lol1
            }
          }
          fragment lol1 on User {
            p1: posts {
              ...lol2
            }
            p2: posts {
              ...lol2
            }
            p3: posts {
              ...lol2
            }
            p4: posts {
              ...lol2
            }
            p5: posts {
              ...lol2
            }
          }
          fragment lol2 on Post {
            title
            author { id }
          }
        `,
    }).expect(400)

    expectGraphQLValidationError(body.errors, [
      { message: 'Operation has depth 4 (max: 3)' },
      { message: 'Request contains 105 fields (max: 8)' },
    ])
  }))
})
