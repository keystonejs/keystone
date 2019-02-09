const { Text, Relationship } = require('@voussoir/fields');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@voussoir/test-utils');
const cuid = require('cuid');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          company: { type: Relationship, ref: 'Company' },
          workHistory: { type: Relationship, ref: 'Company', many: true, access: { read: false } },
          posts: { type: Relationship, ref: 'Post', many: true },
        },
      });

      keystone.createList('Company', {
        fields: {
          name: { type: Text },
          employees: { type: Relationship, ref: 'User' },
        },
      });

      keystone.createList('Post', {
        fields: {
          content: { type: Text },
          author: { type: Relationship, ref: 'User' },
        },
        access: {
          read: false,
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('_FooMeta query for individual list meta data', () => {
      test(
        `'access' field returns results`,
        runner(setupKeystone, async ({ server: { server } }) => {
          const query = await graphqlRequest({
            server,
            query: `
          query {
            _CompaniesMeta {
              access {
                create
                read
                update
                delete
              }
            }
          }
      `,
          });

          expect(query.body).not.toHaveProperty('errors');
          expect(query.body).toHaveProperty('data._CompaniesMeta.access');
          expect(query.body.data._CompaniesMeta.access).toMatchObject({
            create: true,
            read: true,
            update: true,
            delete: true,
          });
        })
      );

      test(
        `'schema' field returns results`,
        runner(setupKeystone, async ({ server: { server } }) => {
          const query = await graphqlRequest({
            server,
            query: `
          query {
            _CompaniesMeta {
              schema {
                type
                queries
                relatedFields {
                  type
                  fields
                }
              }
            }
          }
      `,
          });

          expect(query.body).not.toHaveProperty('errors');
          expect(query.body).toHaveProperty('data._CompaniesMeta.schema');
          expect(query.body.data._CompaniesMeta.schema).toMatchObject({
            type: 'Company',
            queries: ['Company', 'allCompanies', '_allCompaniesMeta'],
            relatedFields: [
              {
                type: 'User',
                // NOTE: Doesn't include workHistory because it is read: false
                fields: ['company'],
              },
            ],
          });
        })
      );
    });

    describe('_ksListsMeta query for all lists meta data', () => {
      test(
        `'access' field returns results`,
        runner(setupKeystone, async ({ server: { server } }) => {
          const query = await graphqlRequest({
            server,
            query: `
          query {
            _ksListsMeta {
              name
              access {
                create
                read
                update
                delete
              }
            }
          }
      `,
          });

          expect(query.body).not.toHaveProperty('errors');
          expect(query.body).toHaveProperty('data._ksListsMeta');
          expect(query.body.data._ksListsMeta).toMatchObject([
            {
              name: 'User',
              access: {
                create: true,
                read: true,
                update: true,
                delete: true,
              },
            },
            {
              name: 'Company',
              access: {
                create: true,
                read: true,
                update: true,
                delete: true,
              },
            },
          ]);
        })
      );

      test(
        'returns results for all visible lists',
        runner(setupKeystone, async ({ server: { server } }) => {
          const query = await graphqlRequest({
            server,
            query: `
          query {
            _ksListsMeta {
              name
              schema {
                type
                queries
                relatedFields {
                  type
                  fields
                }
              }
            }
          }
      `,
          });

          expect(query.body).not.toHaveProperty('errors');
          expect(query.body).toHaveProperty('data._ksListsMeta');
          expect(query.body.data._ksListsMeta).toMatchObject([
            {
              name: 'User',
              schema: {
                queries: ['User', 'allUsers', '_allUsersMeta'],
                relatedFields: [
                  {
                    fields: ['employees'],
                    type: 'Company',
                  },
                  {
                    fields: ['author'],
                    type: 'Post',
                  },
                ],
                type: 'User',
              },
            },
            {
              name: 'Company',
              schema: {
                type: 'Company',
                queries: ['Company', 'allCompanies', '_allCompaniesMeta'],
                relatedFields: [
                  {
                    type: 'User',
                    fields: ['company'],
                  },
                ],
              },
            },
          ]);
        })
      );
    });
  })
);
