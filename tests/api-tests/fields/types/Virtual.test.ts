import { integer, relationship, text, virtual } from '@keystone-next/fields';
import { BaseFields, createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig, testConfig } from '@keystone-next/test-utils-legacy';
import { DatabaseProvider, schema } from '@keystone-next/types';

function makeSetupKeystone(fields: BaseFields<any>) {
  return function setupKeystone(provider: DatabaseProvider) {
    return setupFromConfig({
      provider,
      config: testConfig({
        lists: createSchema({
          Post: list({
            fields: {
              value: integer(),
              ...fields,
            },
          }),
        }),
      }),
    });
  };
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('Virtual field type', () => {
      test(
        'no args',
        runner(
          makeSetupKeystone({
            foo: virtual({
              field: schema.field({
                type: schema.Int,
                resolve() {
                  return 42;
                },
              }),
            }),
          }),
          async ({ context }) => {
            const data = await context.lists.Post.createOne({
              data: { value: 1 },
              query: 'value foo',
            });
            expect(data.value).toEqual(1);
            expect(data.foo).toEqual(42);
          }
        )
      );

      test(
        'args',
        runner(
          makeSetupKeystone({
            foo: virtual({
              field: schema.field({
                type: schema.Int,
                args: {
                  x: schema.arg({ type: schema.Int }),
                  y: schema.arg({ type: schema.Int }),
                },
                resolve: (item, { x = 5, y = 6 }) => x! * y!,
              }),
            }),
          }),
          async ({ context }) => {
            const data = await context.lists.Post.createOne({
              data: { value: 1 },
              query: 'value foo(x: 10, y: 20)',
            });
            expect(data.value).toEqual(1);
            expect(data.foo).toEqual(200);
          }
        )
      );

      test(
        'args - use defaults',
        runner(
          makeSetupKeystone({
            foo: virtual({
              field: schema.field({
                type: schema.Int,
                args: {
                  x: schema.arg({ type: schema.Int }),
                  y: schema.arg({ type: schema.Int }),
                },
                resolve: (item, { x = 5, y = 6 }) => x! * y!,
              }),
            }),
          }),
          async ({ context }) => {
            const data = await context.lists.Post.createOne({
              data: { value: 1 },
              query: 'value foo',
            });
            expect(data.value).toEqual(1);
            expect(data.foo).toEqual(30);
          }
        )
      );

      test(
        'referencing other list type',
        runner(
          function setupKeystone(provider: DatabaseProvider) {
            return setupFromConfig({
              provider,
              config: testConfig({
                lists: createSchema({
                  Organisation: list({
                    fields: {
                      name: text(),
                      authoredPosts: relationship({ ref: 'Post.organisationAuthor', many: true }),
                    },
                  }),
                  Person: list({
                    fields: {
                      name: text(),
                      authoredPosts: relationship({ ref: 'Post.personAuthor', many: true }),
                    },
                  }),
                  Post: list({
                    fields: {
                      organisationAuthor: relationship({ ref: 'Organisation.authoredPosts' }),
                      personAuthor: relationship({ ref: 'Person.authoredPosts' }),
                      author: virtual({
                        field: lists =>
                          schema.field({
                            type: schema.union({
                              name: 'Author',
                              types: [lists.Person.types.output, lists.Organisation.types.output],
                            }),
                            async resolve(rootVal, args, context) {
                              const [personAuthors, organisationAuthors] = await Promise.all([
                                context.db.lists.Person.findMany({
                                  where: { authoredPosts_some: { id: rootVal.id.toString() } },
                                }),
                                context.db.lists.Organisation.findMany({
                                  where: { authoredPosts_some: { id: rootVal.id.toString() } },
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
                }),
              }),
            });
          },
          async ({ context }) => {
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
          }
        )
      );

      test(
        'graphQLReturnFragment',
        runner(
          makeSetupKeystone({
            foo: virtual({
              field: schema.field({
                type: schema.list(
                  schema.object<{ title: string; rating: number }>()({
                    name: 'Movie',
                    fields: {
                      title: schema.field({ type: schema.String }),
                      rating: schema.field({ type: schema.Int }),
                    },
                  })
                ),
                resolve() {
                  return [{ title: 'CATS!', rating: 100 }];
                },
              }),
            }),
          }),
          async ({ context }) => {
            const data = await context.lists.Post.createOne({
              data: { value: 1 },
              query: 'value foo { title rating }',
            });
            expect(data.value).toEqual(1);
            expect(data.foo).toEqual([{ title: 'CATS!', rating: 100 }]);
          }
        )
      );
    });
  })
);
