const { Text, Relationship } = require('@voussoir/fields');
const { keystoneMongoTest, setupServer, graphqlRequest } = require('@voussoir/test-utils');
const cuid = require('cuid');

function setupKeystone() {
  return setupServer({
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
          employees: { type: Relationship, ref: 'User' },
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

describe('_FooMeta query for individual list meta data', () => {
  test(
    `'schema' field returns results`,
    keystoneMongoTest(setupKeystone, async ({ server: { server } }) => {
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
            fields: ['company', 'workHistory', '_workHistoryMeta'],
          },
        ],
      });
    })
  );

  test(
    `'schema.relatedFields' returns empty array when none exist`,
    keystoneMongoTest(setupKeystone, async ({ server: { server } }) => {
      const query = await graphqlRequest({
        server,
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

      expect(query.body).not.toHaveProperty('errors');
      expect(query.body).toHaveProperty('data._PostsMeta.schema');
      expect(query.body.data._PostsMeta.schema).toMatchObject({
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
    keystoneMongoTest(setupKeystone, async ({ server: { server } }) => {
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
