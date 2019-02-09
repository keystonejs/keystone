const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@voussoir/test-utils');

const DateTime = require('./');
const Text = require('../Text');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
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
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('DateTime type', () => {
      test(
        'is present in the schema',
        runner(setupKeystone, async ({ server: { server } }) => {
          // Introspection query
          const {
            body: {
              data: { __schema },
            },
          } = await graphqlRequest({
            server,
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
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const postedAt = '2018-08-31T06:49:07.000Z';

          const createPost = await create('Post', { postedAt });

          // Create an item that does the linking
          const { body } = await graphqlRequest({
            server,
            query: `
        query {
          Post(where: { id: "${createPost.id}" }) {
            postedAt
          }
        }
    `,
          });

          expect(body).toHaveProperty('data.Post.postedAt', postedAt);
        })
      );

      test(
        'input type is accepted as a String',
        runner(setupKeystone, async ({ server: { server } }) => {
          const postedAt = '2018-08-31T06:49:07.000Z';

          // Create an item that does the linking
          const { body } = await graphqlRequest({
            server,
            query: `
        mutation {
          createPost(data: { postedAt: "${postedAt}" }) {
            postedAt
          }
        }
    `,
          });

          expect(body).not.toHaveProperty('errors');
          expect(body).toHaveProperty('data.createPost.postedAt', postedAt);
        })
      );

      test(
        'correctly overrides with new value',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const postedAt = '2018-08-31T06:49:07.000Z';
          const updatedPostedAt = '2018-12-07T05:54:00.556Z';

          const createPost = await create('Post', { postedAt });

          // Create an item that does the linking
          const { body } = await graphqlRequest({
            server,
            query: `
        mutation {
          updatePost(id: "${createPost.id}", data: { postedAt: "${updatedPostedAt}" }) {
            postedAt
          }
        }
    `,
          });

          expect(body).toHaveProperty('data.updatePost.postedAt', updatedPostedAt);
        })
      );

      test(
        'allows replacing date with null',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const postedAt = '2018-08-31T06:49:07.000Z';

          const createPost = await create('Post', { postedAt });

          // Create an item that does the linking
          const { body } = await graphqlRequest({
            server,
            query: `
        mutation {
          updatePost(id: "${createPost.id}", data: { postedAt: null }) {
            postedAt
          }
        }
    `,
          });

          expect(body).toHaveProperty('data.updatePost.postedAt', null);
        })
      );

      test(
        'allows initialising to null',
        runner(setupKeystone, async ({ server: { server } }) => {
          // Create an item that does the linking
          const { body } = await graphqlRequest({
            server,
            query: `
        mutation {
          createPost(data: { postedAt: null }) {
            postedAt
          }
        }
    `,
          });

          expect(body).toHaveProperty('data.createPost.postedAt', null);
        })
      );

      test(
        'Does not get clobbered when updating unrelated field',
        runner(setupKeystone, async ({ server: { server }, create }) => {
          const postedAt = '2018-08-31T06:49:07.000Z';
          const title = 'Hello world';

          const createPost = await create('Post', { postedAt, title });

          // Create an item that does the linking
          const { body } = await graphqlRequest({
            server,
            query: `
        mutation {
          updatePost(id: "${createPost.id}", data: { title: "Something else" }) {
            postedAt
          }
        }
    `,
          });

          expect(body).toHaveProperty('data.updatePost.postedAt', postedAt);
        })
      );
    });
  })
);
