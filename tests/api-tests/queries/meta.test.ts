import { ProviderName, testConfig } from '@keystone-next/test-utils-legacy';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';

function setupKeystone(provider: ProviderName) {
  return setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        User: list({
          fields: {
            company: relationship({ ref: 'Company' }),
            workHistory: relationship({ ref: 'Company', many: true }),
          },
        }),
        Company: list({
          fields: {
            name: text(),
            employees: relationship({ ref: 'User', many: true }),
          },
        }),
        Post: list({
          fields: {
            content: text(),
            author: relationship({ ref: 'User' }),
          },
        }),
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, provider }) =>
  describe(`Provider: ${provider}`, () => {
    describe('_FooMeta query for individual list meta data', () => {
      test(
        `'schema' field returns results`,
        runner(setupKeystone, async ({ context }) => {
          const data = await context.graphql.run({
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
        runner(setupKeystone, async ({ context }) => {
          const data = await context.graphql.run({
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
        runner(setupKeystone, async ({ context }) => {
          const data = await context.graphql.run({
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
                    type: expect.stringMatching(/AutoIncrementImplementation/),
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
                    type: expect.stringMatching(/AutoIncrementImplementation/),
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
                    type: expect.stringMatching(/AutoIncrementImplementation/),
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
        runner(setupKeystone, async ({ context }) => {
          const data = await context.graphql.run({
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
                    type: expect.stringMatching(/AutoIncrementImplementation/),
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
        runner(setupKeystone, async ({ context }) => {
          const data = await context.graphql.run({
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
