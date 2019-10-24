const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystonejs/test-utils');
const cuid = require('cuid');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          company: { type: Relationship, ref: 'Company' },
          workHistory: { type: Relationship, ref: 'Company', many: true },
        },
      });

      keystone.createList('Company', {
        fields: {
          name: { type: Text },
          employees: { type: Relationship, ref: 'User', many: true },
        },
      });

      keystone.createList('Post', {
        fields: {
          content: { type: Text },
          author: { type: Relationship, ref: 'User' },
        },
      });
    },
  });
}
multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('_FooMeta query for individual list meta data', () => {
      test(
        `'schema' field returns results`,
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('_CompaniesMeta.schema');
          expect(data._CompaniesMeta.schema).toMatchObject({
            type: 'Company',
            queries: ['Company', 'allCompanies', '_allCompaniesMeta'],
            relatedFields: [
              {
                type: 'User',
                fields: ['company', 'workHistory', '_workHistoryMeta'],
              },
            ],
          });
        })
      );

      test(
        `'schema.relatedFields' returns empty array when none exist`,
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await graphqlRequest({
            keystone,
            query: `
          query {
            _PostsMeta {
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

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('_PostsMeta.schema');
          expect(data._PostsMeta.schema).toMatchObject({
            type: 'Post',
            queries: ['Post', 'allPosts', '_allPostsMeta'],
            relatedFields: [],
          });
        })
      );
    });

    describe('_ksListsMeta query for all lists meta data', () => {
      test(
        'returns results for all lists',
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await graphqlRequest({
            keystone,
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

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('_ksListsMeta');
          expect(data._ksListsMeta).toMatchObject([
            {
              name: 'User',
              schema: {
                queries: ['User', 'allUsers', '_allUsersMeta'],
                relatedFields: [
                  {
                    fields: ['employees', '_employeesMeta'],
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
                    fields: ['company', 'workHistory', '_workHistoryMeta'],
                  },
                ],
              },
            },
            {
              name: 'Post',
              schema: {
                queries: ['Post', 'allPosts', '_allPostsMeta'],
                relatedFields: [],
                type: 'Post',
              },
            },
          ]);
        })
      );
    });
  })
);
