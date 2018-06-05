/* eslint-disable jest/valid-expect */
const {
  getStaticListName,
  getDynamicListName,
  getDynamicForAdminOnlyListName,
  accessCombinations,
  stayLoggedIn,
} = require('../util');

const FAKE_ID = '5b3eabd9e9f2e3e4866742ea';

describe('Access Control, List, GraphQL', () => {
  describe('Schema', () => {
    let queries;
    let mutations;
    let types;

    function sanityCheckGraphQL() {
      // check to make sure we're not getting false positives
      return Promise.all([
        expect(types).include('User'),
        expect(queries).include('allUsers'),
        expect(mutations).include('createUser'),
      ]);
    }

    stayLoggedIn('su');

    before(() =>
      // Check graphql types via introspection
      cy
        .graphql_query(
          '/admin/api',
          `{
          __schema {
            types {
              name
            }
            queryType {
              fields {
                name
              }
            }
            mutationType {
              fields {
                name
              }
            }
          }
        }`
        )
        .then(({ data: { __schema } }) => {
          queries = __schema.queryType.fields.map(({ name }) => name);
          mutations = __schema.mutationType.fields.map(({ name }) => name);
          types = __schema.types.map(({ name }) => name);
        })
    );

    describe('static', () => {
      accessCombinations.forEach(access => {
        it(JSON.stringify(access), () => {
          sanityCheckGraphQL();
          const name = getStaticListName(access);

          // The type is used in all the queries and mutations as a return type
          if (access.create || access.read || access.update || access.delete) {
            expect(types, 'types').include(`${name}`);
          } else {
            expect(types, 'types').not.include(`${name}`);
          }

          // Filter types are only used when reading
          if (access.read) {
            expect(types, 'types').include(`${name}WhereInput`);
            expect(types, 'types').include(`${name}WhereUniqueInput`);
          } else {
            expect(types, 'types').not.include(`${name}WhereInput`);
            expect(types, 'types').not.include(`${name}WhereUniqueInput`);
          }

          // Queries are only accessible when reading
          if (access.read) {
            expect(queries, 'queries').include(`${name}`);
            expect(queries, 'queries').include(`all${name}s`);
            expect(queries, 'queries').include(`_all${name}sMeta`);
          } else {
            expect(queries, 'queries').not.include(`${name}`);
            expect(queries, 'queries').not.include(`all${name}s`);
            expect(queries, 'queries').not.include(`_all${name}sMeta`);
          }

          if (access.create) {
            expect(mutations, 'mutations').include(`create${name}`);
          } else {
            expect(mutations, 'mutations').not.include(`create${name}`);
          }

          if (access.update) {
            expect(mutations, 'mutations').include(`update${name}`);
          } else {
            expect(mutations, 'mutations').not.include(`update${name}`);
          }

          if (access.delete) {
            expect(mutations, 'mutations').include(`delete${name}`);
          } else {
            expect(mutations, 'mutations').not.include(`delete${name}`);
          }
        });
      });
    });

    describe('dynamic', () => {
      accessCombinations.forEach(access => {
        it(JSON.stringify(access), () => {
          sanityCheckGraphQL();

          const name = getDynamicListName(access);

          // All types, etc, are included when dynamic no matter the config (because
          // it can't be resolved until runtime)
          expect(types, 'types').include(`${name}`);
          expect(types, 'types').include(`${name}WhereInput`);
          expect(types, 'types').include(`${name}WhereUniqueInput`);

          expect(queries, 'queries').include(`${name}`);
          expect(queries, 'queries').include(`all${name}s`);
          expect(queries, 'queries').include(`_all${name}sMeta`);

          expect(mutations, 'mutations').include(`create${name}`);
          expect(mutations, 'mutations').include(`update${name}`);
          expect(mutations, 'mutations').include(`delete${name}`);
        });
      });
    });
  });

  describe('performing actions', () => {
    describe('dynamic based on user', () => {
      describe('logged out', () => {
        before(() => cy.visit('/admin'));

        accessCombinations.filter(({ create }) => create).forEach(access => {
          it(`create: ${JSON.stringify(access)}`, () => {
            const createMutationName = `create${getDynamicForAdminOnlyListName(
              access
            )}`;

            cy
              .graphql_mutate(
                '/admin/api',
                `mutation { ${createMutationName}(data: { foo: "bar" }) { id } }`
              )
              .then(({ errors }) => {
                expect(errors, 'create mutation Errors').to.have.deep.property(
                  '[0].name',
                  'AccessDeniedError'
                );
                expect(errors, 'create mutation Errors').to.have.deep.property(
                  '[0].message',
                  'You do not have access to this resource'
                );
                expect(errors, 'create mutation Errors').to.have.deep.property(
                  '[0].path[0]',
                  createMutationName
                );
              });
          });
        });

        accessCombinations.filter(({ read }) => read).forEach(access => {
          it(`query: ${JSON.stringify(access)}`, () => {
            const allQueryName = `all${getDynamicForAdminOnlyListName(
              access
            )}s`;
            cy
              .graphql_query('/admin/api', `query { ${allQueryName} { id } }`)
              .then(({ errors }) => {
                expect(errors, 'allQuery Errors').to.have.deep.property(
                  '[0].name',
                  'AccessDeniedError'
                );
                expect(errors, 'allQuery Errors').to.have.deep.property(
                  '[0].message',
                  'You do not have access to this resource'
                );
                expect(errors, 'allQuery Errors').to.have.deep.property(
                  '[0].path[0]',
                  allQueryName
                );
              });

            const metaName = `_all${getDynamicForAdminOnlyListName(
              access
            )}sMeta`;
            cy
              .graphql_query('/admin/api', `query { ${metaName} { count } }`)
              .then(({ errors }) => {
                expect(errors, 'meta Errors').to.have.deep.property(
                  '[0].name',
                  'AccessDeniedError'
                );
                expect(errors, 'meta Errors').to.have.deep.property(
                  '[0].message',
                  'You do not have access to this resource'
                );
                expect(errors, 'meta Errors').to.have.deep.property(
                  '[0].path[0]',
                  metaName
                );
              });

            const singleQueryName = getDynamicForAdminOnlyListName(access);
            cy
              .graphql_query(
                '/admin/api',
                `query { ${singleQueryName}(where: { id: "abc123" }) { id } }`
              )
              .then(({ errors }) => {
                expect(errors, 'singleQuery Errors').to.have.deep.property(
                  '[0].name',
                  'AccessDeniedError'
                );
                expect(errors, 'singleQuery Errors').to.have.deep.property(
                  '[0].message',
                  'You do not have access to this resource'
                );
                expect(errors, 'singleQuery Errors').to.have.deep.property(
                  '[0].path[0]',
                  singleQueryName
                );
              });
          });
        });

        accessCombinations.filter(({ update }) => update).forEach(access => {
          it(`update: ${JSON.stringify(access)}`, () => {
            const updateMutationName = `update${getDynamicForAdminOnlyListName(
              access
            )}`;
            cy
              .graphql_mutate(
                '/admin/api',
                `mutation { ${updateMutationName}(id: "${FAKE_ID}", data: { foo: "bar" }) { id } }`
              )
              .then(({ errors }) => {
                expect(errors, 'update mutation Errors').to.have.deep.property(
                  '[0].name',
                  'AccessDeniedError'
                );
                expect(errors, 'update mutation Errors').to.have.deep.property(
                  '[0].message',
                  'You do not have access to this resource'
                );
                expect(errors, 'update mutation Errors').to.have.deep.property(
                  '[0].path[0]',
                  updateMutationName
                );
              });
          });
        });

        accessCombinations.filter(access => access.delete).forEach(access => {
          it(`delete: ${JSON.stringify(access)}`, () => {
            const deleteMutationName = `delete${getDynamicForAdminOnlyListName(
              access
            )}`;
            cy
              .graphql_mutate(
                '/admin/api',
                `mutation { ${deleteMutationName}(id: "${FAKE_ID}") { id } }`
              )
              .then(({ errors }) => {
                expect(errors, 'delete mutation Errors').to.have.deep.property(
                  '[0].name',
                  'AccessDeniedError'
                );
                expect(errors, 'delete mutation Errors').to.have.deep.property(
                  '[0].message',
                  'You do not have access to this resource'
                );
                expect(errors, 'delete mutation Errors').to.have.deep.property(
                  '[0].path[0]',
                  deleteMutationName
                );
              });

            const multiDeleteMutationName = `delete${getDynamicForAdminOnlyListName(
              access
            )}s`;
            cy
              .graphql_mutate(
                '/admin/api',
                `mutation { ${multiDeleteMutationName}(ids: ["${FAKE_ID}"]) { id } }`
              )
              .then(({ errors }) => {
                expect(errors, 'delete mutation Errors').to.have.deep.property(
                  '[0].name',
                  'AccessDeniedError'
                );
                expect(errors, 'delete mutation Errors').to.have.deep.property(
                  '[0].message',
                  'You do not have access to this resource'
                );
                expect(errors, 'delete mutation Errors').to.have.deep.property(
                  '[0].path[0]',
                  multiDeleteMutationName
                );
              });
          });
        });
      });

      describe('logged in', () => {
        stayLoggedIn('su');

        accessCombinations.filter(({ create }) => create).forEach(access => {
          it(`create: ${JSON.stringify(access)}`, () => {
            const createMutationName = `create${getDynamicForAdminOnlyListName(
              access
            )}`;

            cy
              .graphql_mutate(
                '/admin/api',
                `mutation { ${createMutationName}(data: { foo: "bar" }) { id } }`
              )
              .then(({ data, errors }) => {
                expect(errors, 'create mutation Errors').to.equal(undefined);
                expect(
                  data[createMutationName],
                  `createMutation data.${createMutationName}`
                ).to.have.property('id');
              });
          });
        });

        accessCombinations.filter(({ read }) => read).forEach(access => {
          it(`query: ${JSON.stringify(access)}`, () => {
            const allQueryName = `all${getDynamicForAdminOnlyListName(
              access
            )}s`;
            cy
              .graphql_query('/admin/api', `query { ${allQueryName} { id } }`)
              .then(({ data, errors }) => {
                expect(errors, 'allQuery Errors').to.equal(undefined);
                expect(
                  data[allQueryName],
                  `allQuery data.${allQueryName}`
                ).to.have.property('length');
              });

            const metaName = `_all${getDynamicForAdminOnlyListName(
              access
            )}sMeta`;
            cy
              .graphql_query('/admin/api', `query { ${metaName} { count } }`)
              .then(({ data, errors }) => {
                expect(errors, 'meta Errors').to.equal(undefined);
                expect(
                  data[metaName].count,
                  `meta data.${metaName}.count`
                ).to.be.gte(0);
              });

            const singleQueryName = getDynamicForAdminOnlyListName(access);
            cy
              .graphql_query(
                '/admin/api',
                `query { ${singleQueryName}(where: { id: "${FAKE_ID}" }) { id } }`
              )
              .then(({ data, errors }) => {
                expect(errors, 'single query Errors').to.equal(undefined);
                expect(
                  data[singleQueryName],
                  `meta data.${singleQueryName}`
                ).to.equal(null);
              });
          });
        });

        accessCombinations.filter(({ update }) => update).forEach(access => {
          it(`update: ${JSON.stringify(access)}`, () => {
            const updateMutationName = `update${getDynamicForAdminOnlyListName(
              access
            )}`;
            cy
              .graphql_mutate(
                '/admin/api',
                `mutation { ${updateMutationName}(id: "${FAKE_ID}", data: { foo: "bar" }) { id } }`
              )
              .then(({ errors }) => {
                // It errors because it's a fake ID.
                // That's ok, as long as it's not an AccessDeniedError.
                // We test that updates actually work elsewhere.
                expect(
                  errors[0],
                  'update mutation Errors'
                ).to.not.have.ownProperty('name');
                expect(
                  errors[0],
                  'update mutation Errors'
                ).to.not.have.property(
                  'message',
                  'You do not have access to this resource'
                );
              });
          });
        });

        accessCombinations.filter(access => access.delete).forEach(access => {
          it(`delete: ${JSON.stringify(access)}`, () => {
            const deleteMutationName = `delete${getDynamicForAdminOnlyListName(
              access
            )}`;
            cy
              .graphql_mutate(
                '/admin/api',
                `mutation { ${deleteMutationName}(id: "${FAKE_ID}") { id } }`
              )
              .then(({ data, errors }) => {
                expect(errors, 'delete mutation Errors').to.equal(undefined);
                expect(data, 'deleteMutation data').to.have.ownProperty(
                  deleteMutationName
                );
              });

            const multiDeleteMutationName = `delete${getDynamicForAdminOnlyListName(
              access
            )}s`;
            cy
              .graphql_mutate(
                '/admin/api',
                `mutation { ${multiDeleteMutationName}(ids: ["${FAKE_ID}"]) { id } }`
              )
              .then(({ data, errors }) => {
                expect(errors, 'delete mutation Errors').to.equal(undefined);
                expect(data, 'deleteMutation data').to.have.ownProperty(
                  multiDeleteMutationName
                );
              });
          });
        });
      });
    });
  });
});
