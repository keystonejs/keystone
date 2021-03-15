const { multiAdapterRunners, setupServer } = require('@keystone-next/test-utils-legacy');
const { Text, DateTime } = require('@keystone-next/fields-legacy');
const { createItem } = require('@keystone-next/server-side-graphql-client-legacy');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('Post', {
        fields: {
          title: { type: Text },
          postedAt: { type: DateTime },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) => {
  if (adapterName === 'prisma_sqlite') {
    // Appease jest, which doesn't like it when you have an empty test file.
    test('noop', () => {});
  } else {
    describe(`Adapter: ${adapterName}`, () => {
      describe('DateTime type', () => {
        test(
          'is present in the schema',
          runner(setupKeystone, async ({ keystone }) => {
            // Introspection query
            const {
              data: { __schema },
              errors,
            } = await keystone.executeGraphQL({
              query: `
        query {
          __schema {
            types {
              name
              kind
              fields {
                name
                type {
                  name
                }
              }
            }
          }
        }
      `,
            });
            expect(errors).toBe(undefined);
            expect(__schema).toHaveProperty('types');
            expect(__schema.types).toMatchObject(
              expect.arrayContaining([
                expect.objectContaining({
                  name: 'DateTime',
                  kind: 'SCALAR',
                }),
              ])
            );

            expect(__schema.types).toMatchObject(
              expect.arrayContaining([
                expect.objectContaining({
                  name: 'Post',
                  fields: expect.arrayContaining([
                    expect.objectContaining({
                      name: 'postedAt',
                      type: {
                        name: 'DateTime',
                      },
                    }),
                  ]),
                }),
              ])
            );
          })
        );

        test(
          'response is serialized as a String',
          runner(setupKeystone, async ({ keystone }) => {
            const postedAt = '2018-08-31T06:49:07.000Z';

            const createPost = await createItem({
              keystone,
              listKey: 'Post',
              item: { postedAt },
            });

            // Create an item that does the linking
            const { data, errors } = await keystone.executeGraphQL({
              query: `
        query {
          Post(where: { id: "${createPost.id}" }) {
            postedAt
          }
        }
    `,
            });
            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('Post.postedAt', postedAt);
          })
        );

        test(
          'input type is accepted as a String',
          runner(setupKeystone, async ({ keystone }) => {
            const postedAt = '2018-08-31T06:49:07.000Z';

            // Create an item that does the linking
            const { data, errors } = await keystone.executeGraphQL({
              query: `
        mutation {
          createPost(data: { postedAt: "${postedAt}" }) {
            postedAt
          }
        }
    `,
            });

            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('createPost.postedAt', postedAt);
          })
        );

        test(
          'correctly overrides with new value',
          runner(setupKeystone, async ({ keystone }) => {
            const postedAt = '2018-08-31T06:49:07.000Z';
            const updatedPostedAt = '2018-12-07T05:54:00.556Z';

            const createPost = await createItem({
              keystone,
              listKey: 'Post',
              item: { postedAt },
            });

            // Create an item that does the linking
            const { data, errors } = await keystone.executeGraphQL({
              query: `
        mutation {
          updatePost(id: "${createPost.id}", data: { postedAt: "${updatedPostedAt}" }) {
            postedAt
          }
        }
    `,
            });
            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('updatePost.postedAt', updatedPostedAt);
          })
        );

        test(
          'allows replacing date with null',
          runner(setupKeystone, async ({ keystone }) => {
            const postedAt = '2018-08-31T06:49:07.000Z';

            const createPost = await createItem({
              keystone,
              listKey: 'Post',
              item: { postedAt },
            });

            // Create an item that does the linking
            const { data, errors } = await keystone.executeGraphQL({
              query: `
        mutation {
          updatePost(id: "${createPost.id}", data: { postedAt: null }) {
            postedAt
          }
        }
    `,
            });
            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('updatePost.postedAt', null);
          })
        );

        test(
          'allows initialising to null',
          runner(setupKeystone, async ({ keystone }) => {
            // Create an item that does the linking
            const { data, errors } = await keystone.executeGraphQL({
              query: `
        mutation {
          createPost(data: { postedAt: null }) {
            postedAt
          }
        }
    `,
            });
            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('createPost.postedAt', null);
          })
        );

        test(
          'Does not get clobbered when updating unrelated field',
          runner(setupKeystone, async ({ keystone }) => {
            const postedAt = '2018-08-31T06:49:07.000Z';
            const title = 'Hello world';

            const createPost = await createItem({
              keystone,
              listKey: 'Post',
              item: { postedAt, title },
            });

            // Create an item that does the linking
            const { data, errors } = await keystone.executeGraphQL({
              query: `
        mutation {
          updatePost(id: "${createPost.id}", data: { title: "Something else" }) {
            postedAt
          }
        }
    `,
            });
            expect(errors).toBe(undefined);
            expect(data).toHaveProperty('updatePost.postedAt', postedAt);
          })
        );
      });
    });
  }
});
