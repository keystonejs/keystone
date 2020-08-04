const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          company: { type: Relationship, ref: 'Company' },
          workHistory: {
            type: Relationship,
            ref: 'Company',
            many: true,
            access: { read: false },
          },
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
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await keystone.executeGraphQL({
            query: `
          query {
            _CompaniesMeta {
              access {
                create
                read
                update
                delete
                auth
              }
            }
          }
      `,
          });

          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('_CompaniesMeta.access');
          expect(data._CompaniesMeta.access).toMatchObject({
            create: true,
            read: true,
            update: true,
            delete: true,
            auth: true,
          });
        })
      );

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
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await keystone.executeGraphQL({
            query: `
          query {
            _ksListsMeta {
              name
              access {
                create
                read
                update
                delete
                auth
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
              access: {
                create: true,
                read: true,
                update: true,
                delete: true,
                auth: true,
              },
            },
            {
              name: 'Company',
              access: {
                create: true,
                read: true,
                update: true,
                delete: true,
                auth: true,
              },
            },
          ]);
        })
      );

      test(
        'returns results for all visible lists',
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
