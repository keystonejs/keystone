const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
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
          const { data, errors } = await keystone.executeGraphQL({
            query: `
          query {
            _CompaniesMeta {
              schema {
                type
                queries {
                  item
                  list
                  meta
                }
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
            queries: {
              item: 'Company',
              list: 'allCompanies',
              meta: '_allCompaniesMeta',
            },
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
          const { data, errors } = await keystone.executeGraphQL({
            query: `
          query {
            _PostsMeta {
              schema {
                type
                queries {
                  item
                  list
                  meta
                }
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
            queries: {
              item: 'Post',
              list: 'allPosts',
              meta: '_allPostsMeta',
            },
            relatedFields: [],
          });
        })
      );
    });

    describe('_ksListsMeta query for all lists meta data', () => {
      test(
        'returns results for all lists',
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await keystone.executeGraphQL({
            query: `
          query {
            _ksListsMeta {
              name
              schema {
                type
                queries {
                  item
                  list
                  meta
                }
                fields {
                  name
                  type
                }
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
                queries: {
                  item: 'User',
                  list: 'allUsers',
                  meta: '_allUsersMeta',
                },
                fields: [
                  {
                    name: 'id',
                    type: expect.stringMatching(
                      /MongoIdImplementation|AutoIncrementImplementation/
                    ),
                  },
                  {
                    name: 'company',
                    type: 'Relationship',
                  },
                  {
                    name: 'workHistory',
                    type: 'Relationship',
                  },
                ],
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
                queries: {
                  item: 'Company',
                  list: 'allCompanies',
                  meta: '_allCompaniesMeta',
                },
                fields: [
                  {
                    name: 'id',
                    type: expect.stringMatching(
                      /MongoIdImplementation|AutoIncrementImplementation/
                    ),
                  },
                  {
                    name: 'name',
                    type: 'Text',
                  },
                  {
                    name: 'employees',
                    type: 'Relationship',
                  },
                ],
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
                queries: {
                  item: 'Post',
                  list: 'allPosts',
                  meta: '_allPostsMeta',
                },
                fields: [
                  {
                    name: 'id',
                    type: expect.stringMatching(
                      /MongoIdImplementation|AutoIncrementImplementation/
                    ),
                  },
                  {
                    name: 'content',
                    type: 'Text',
                  },
                  {
                    name: 'author',
                    type: 'Relationship',
                  },
                ],
                relatedFields: [],
                type: 'Post',
              },
            },
          ]);
        })
      );

      test(
        'returns results for one list',
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await keystone.executeGraphQL({
            query: `
          query {
            _ksListsMeta(where: { key: "User" }) {
              name
              schema {
                type
                queries {
                  item
                  list
                  meta
                }
                fields {
                  name
                  type
                }
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
                queries: {
                  item: 'User',
                  list: 'allUsers',
                  meta: '_allUsersMeta',
                },
                fields: [
                  {
                    name: 'id',
                    type: expect.stringMatching(
                      /MongoIdImplementation|AutoIncrementImplementation/
                    ),
                  },
                  {
                    name: 'company',
                    type: 'Relationship',
                  },
                  {
                    name: 'workHistory',
                    type: 'Relationship',
                  },
                ],
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
          ]);
        })
      );

      test(
        'returns results for one list and one type of field',
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await keystone.executeGraphQL({
            query: `
          query {
            _ksListsMeta(where: { key: "Company" }) {
              name
              schema {
                type
                queries {
                  item
                  list
                  meta
                }
                fields(where: { type: "Text" }) {
                  name
                  type
                }
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
              name: 'Company',
              schema: {
                type: 'Company',
                queries: {
                  item: 'Company',
                  list: 'allCompanies',
                  meta: '_allCompaniesMeta',
                },
                fields: [
                  {
                    name: 'name',
                    type: 'Text',
                  },
                ],
                relatedFields: [
                  {
                    type: 'User',
                    fields: ['company', 'workHistory', '_workHistoryMeta'],
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
