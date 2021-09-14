import { integer, relationship, text, virtual } from '@keystone-next/keystone/fields';
import { BaseFields, list } from '@keystone-next/keystone';
import { setupTestEnv, setupTestRunner } from '@keystone-next/keystone/testing';
import { graphql } from '@keystone-next/keystone/types';
import { apiTestConfig } from '../../utils';

function makeRunner(fields: BaseFields<any>) {
  return setupTestRunner({
    config: apiTestConfig({
      lists: {
        Post: list({
          fields: {
            value: integer(),
            ...fields,
          },
        }),
      },
    }),
  });
}

describe('Virtual field type', () => {
  test(
    'no args',
    makeRunner({
      foo: virtual({
        field: graphql.field({
          type: graphql.Int,
          resolve() {
            return 42;
          },
        }),
      }),
    })(async ({ context }) => {
      const data = await context.lists.Post.createOne({
        data: { value: 1 },
        query: 'value foo',
      });
      expect(data.value).toEqual(1);
      expect(data.foo).toEqual(42);
    })
  );

  test(
    'args',
    makeRunner({
      foo: virtual({
        field: graphql.field({
          type: graphql.Int,
          args: {
            x: graphql.arg({ type: graphql.Int }),
            y: graphql.arg({ type: graphql.Int }),
          },
          resolve: (item, { x = 5, y = 6 }) => x! * y!,
        }),
      }),
    })(async ({ context }) => {
      const data = await context.lists.Post.createOne({
        data: { value: 1 },
        query: 'value foo(x: 10, y: 20)',
      });
      expect(data.value).toEqual(1);
      expect(data.foo).toEqual(200);
    })
  );

  test(
    'referencing other list type',
    setupTestRunner({
      config: apiTestConfig({
        lists: {
          Organisation: list({
            fields: {
              name: text(),
              authoredPosts: relationship({
                ref: 'Post.organisationAuthor',
                many: true,
                isFilterable: true,
              }),
            },
          }),
          Person: list({
            fields: {
              name: text(),
              authoredPosts: relationship({
                ref: 'Post.personAuthor',
                many: true,
                isFilterable: true,
              }),
            },
          }),
          Post: list({
            fields: {
              organisationAuthor: relationship({ ref: 'Organisation.authoredPosts' }),
              personAuthor: relationship({ ref: 'Person.authoredPosts' }),
              author: virtual({
                ui: { listView: { fieldMode: 'hidden' }, itemView: { fieldMode: 'hidden' } },
                field: lists =>
                  graphql.field({
                    type: graphql.union({
                      name: 'Author',
                      types: [lists.Person.types.output, lists.Organisation.types.output],
                    }),
                    async resolve(rootVal, args, context) {
                      const [personAuthors, organisationAuthors] = await Promise.all([
                        context.db.lists.Person.findMany({
                          where: {
                            authoredPosts: { some: { id: { equals: rootVal.id.toString() } } },
                          },
                        }),
                        context.db.lists.Organisation.findMany({
                          where: {
                            authoredPosts: { some: { id: { equals: rootVal.id.toString() } } },
                          },
                        }),
                      ]);
                      if (personAuthors.length) {
                        return { __typename: 'Person', ...personAuthors[0] };
                      }
                      if (organisationAuthors.length) {
                        return { __typename: 'Organisation', ...organisationAuthors[0] };
                      }
                    },
                  }),
              }),
            },
          }),
        },
      }),
    })(async ({ context }) => {
      const data = await context.lists.Post.createOne({
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
      });
      expect(data.author.name).toEqual('person author');
      expect(data.author.__typename).toEqual('Person');
      const data2 = await context.lists.Post.createOne({
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
      });
      expect(data2.author.name).toEqual('organisation author');
      expect(data2.author.__typename).toEqual('Organisation');
    })
  );

  test("errors when a non leaf type is used but the field isn't hidden in the Admin UI and ui.query isn't provided", async () => {
    await expect(
      setupTestEnv({
        config: apiTestConfig({
          lists: {
            Post: list({
              fields: {
                virtual: virtual({
                  field: graphql.field({
                    type: graphql.object<any>()({
                      name: 'Something',
                      fields: {
                        something: graphql.field({ type: graphql.String }),
                      },
                    }),
                  }),
                }),
              },
            }),
          },
        }),
      })
    ).rejects.toMatchInlineSnapshot(`
            [Error: The virtual field at Post.virtual requires a selection for the Admin UI but ui.query is unspecified and ui.listView.fieldMode and ui.itemView.fieldMode are not both set to 'hidden'.
            Either set ui.query with what the Admin UI should fetch or hide the field from the Admin UI by setting ui.listView.fieldMode and ui.itemView.fieldMode to 'hidden'.
            When setting ui.query, it is interpolated into a GraphQL query like this:
            query {
              post(where: { id: "..." }) {
                virtual\${ui.query}
              }
            }]
          `);
  });
});
