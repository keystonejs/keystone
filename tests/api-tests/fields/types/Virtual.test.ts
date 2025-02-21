import { integer, relationship, text, virtual } from '@keystone-6/core/fields'
import { type BaseFields, list, g } from '@keystone-6/core'
import { setupTestEnv, setupTestRunner } from '@keystone-6/api-tests/test-runner'
import { allowAll } from '@keystone-6/core/access'

function makeRunner(fields: BaseFields<any>) {
  return setupTestRunner({
    config: {
      lists: {
        Post: list({
          access: allowAll,
          fields: {
            value: integer(),
            ...fields,
          },
        }),
      },
    },
  })
}

describe('Virtual field type', () => {
  test(
    'no args',
    makeRunner({
      foo: virtual({
        field: g.field({
          type: g.Int,
          resolve() {
            return 42
          },
        }),
      }),
    })(async ({ context }) => {
      const data = await context.query.Post.createOne({
        data: { value: 1 },
        query: 'value foo',
      })
      expect(data.value).toEqual(1)
      expect(data.foo).toEqual(42)
    })
  )

  test(
    'args',
    makeRunner({
      foo: virtual({
        field: g.field({
          type: g.Int,
          args: {
            x: g.arg({ type: g.Int }),
            y: g.arg({ type: g.Int }),
          },
          resolve: (item, { x = 5, y = 6 }) => x! * y!,
        }),
      }),
    })(async ({ context }) => {
      const data = await context.query.Post.createOne({
        data: { value: 1 },
        query: 'value foo(x: 10, y: 20)',
      })
      expect(data.value).toEqual(1)
      expect(data.foo).toEqual(200)
    })
  )

  test(
    'referencing other list type',
    setupTestRunner({
      config: {
        lists: {
          Organisation: list({
            access: allowAll,
            fields: {
              name: text(),
              authoredPosts: relationship({ ref: 'Post.organisationAuthor', many: true }),
            },
          }),
          Person: list({
            access: allowAll,
            fields: {
              name: text(),
              authoredPosts: relationship({ ref: 'Post.personAuthor', many: true }),
            },
          }),
          Post: list({
            access: allowAll,
            fields: {
              organisationAuthor: relationship({ ref: 'Organisation.authoredPosts' }),
              personAuthor: relationship({ ref: 'Person.authoredPosts' }),
              author: virtual({
                ui: { listView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } },
                field: lists =>
                  g.field({
                    type: g.union({
                      name: 'Author',
                      types: [lists.Person.types.output, lists.Organisation.types.output],
                    }),
                    async resolve(rootVal, args, context) {
                      const [personAuthors, organisationAuthors] = await Promise.all([
                        context.db.Person.findMany({
                          where: {
                            authoredPosts: { some: { id: { equals: rootVal.id.toString() } } },
                          },
                        }),
                        context.db.Organisation.findMany({
                          where: {
                            authoredPosts: { some: { id: { equals: rootVal.id.toString() } } },
                          },
                        }),
                      ])
                      if (personAuthors.length) {
                        return { __typename: 'Person', ...personAuthors[0] }
                      }
                      if (organisationAuthors.length) {
                        return { __typename: 'Organisation', ...organisationAuthors[0] }
                      }
                    },
                  }),
              }),
            },
          }),
        },
      },
    })(async ({ context }) => {
      const data = await context.query.Post.createOne({
        data: { personAuthor: { create: { name: 'person author' } } },
        query: `
                author {
                  __typename
                  ... on Person {
                    name
                  }
                  ... on Organisation {
                    name
                  }
                }
              `,
      })
      expect(data.author.name).toEqual('person author')
      expect(data.author.__typename).toEqual('Person')
      const data2 = await context.query.Post.createOne({
        data: { organisationAuthor: { create: { name: 'organisation author' } } },
        query: `
                author {
                  __typename
                  ... on Person {
                    name
                  }
                  ... on Organisation {
                    name
                  }
                }
              `,
      })
      expect(data2.author.name).toEqual('organisation author')
      expect(data2.author.__typename).toEqual('Organisation')
    })
  )

  test("errors when a non leaf type is used but the field isn't hidden in the Admin UI and ui.query isn't provided", async () => {
    await expect(
      setupTestEnv({
        lists: {
          Post: list({
            access: allowAll,
            fields: {
              virtual: virtual({
                field: g.field({
                  type: g.object<any>()({
                    name: 'Something',
                    fields: {
                      something: g.field({ type: g.String }),
                    },
                  }),
                }),
              }),
            },
          }),
        },
      })
    ).rejects.toMatchInlineSnapshot(
      `[Error: Post.virtual requires ui.query, or ui.listView.fieldMode and ui.itemView.fieldMode to be set to 'hidden']`
    )
  })
})
