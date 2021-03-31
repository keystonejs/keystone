import { AdapterName, testConfig } from '@keystone-next/test-utils-legacy';
import { text, relationship } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';

function setupKeystone(adapterName: AdapterName) {
  return setupFromConfig({
    adapterName,
    config: testConfig({
      lists: createSchema({
        User: list({
          fields: {
            company: relationship({ ref: 'Company' }),
            workHistory: relationship({
              ref: 'Company',
              many: true,
              access: { read: false },
            }),
            posts: relationship({ ref: 'Post', many: true }),
          },
        }),
        Company: list({
          fields: {
            name: text(),
            employees: relationship({ ref: 'User' }),
          },
        }),
        Post: list({
          fields: {
            content: text(),
            author: relationship({ ref: 'User' }),
          },
          access: { read: false },
        }),
      }),
    }),
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('_FooMeta query for individual list meta data', () => {
      test(
        `'access' field returns results`,
        runner(setupKeystone, async ({ context }) => {
          const data = await context.exitSudo().graphql.run({
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

          expect(data).toHaveProperty('_CompaniesMeta.access');
          expect(data._CompaniesMeta.access).toMatchObject({
            create: true,
            read: true,
            update: true,
            delete: true,
          });
        })
      );

      test(
        `'schema' field returns results`,
        runner(setupKeystone, async ({ context }) => {
          const data = await context.exitSudo().graphql.run({
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
        runner(setupKeystone, async ({ context }) => {
          const data = await context.exitSudo().graphql.run({
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

          expect(data).toHaveProperty('_ksListsMeta');
          expect(data._ksListsMeta).toMatchObject([
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
        runner(setupKeystone, async ({ context }) => {
          const data = await context.exitSudo().graphql.run({
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
                queries: {
                  item: 'Company',
                  list: 'allCompanies',
                  meta: '_allCompaniesMeta',
                },
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
