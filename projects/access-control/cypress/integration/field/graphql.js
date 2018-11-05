/* eslint-disable jest/valid-expect */
const {
  getStaticListName,
  getImperativeListName,
  listNameToCollectionName,
  fieldAccessVariations: fieldMatrix,
  getFieldName,
  stayLoggedIn,
} = require('../util');

const staticList = getStaticListName({
  create: true,
  read: true,
  update: true,
  delete: true,
});
const staticCollection = listNameToCollectionName(staticList);

const imperativeList = getImperativeListName({
  create: true,
  read: true,
  update: true,
  delete: true,
});
const imperativeCollection = listNameToCollectionName(imperativeList);

const identity = val => val;

const arrayToObject = (items, keyedBy, mapFn = identity) =>
  items.reduce((memo, item) => Object.assign(memo, { [item[keyedBy]]: mapFn(item) }), {});

describe('Access Control, Field, GraphQL', () => {
  describe('Schema', () => {
    let queries;
    let mutations;
    let types;

    function sanityCheckGraphQL() {
      // check to make sure we're not getting false positives
      return Promise.all([
        expect(types).to.have.property('User'),
        expect(queries).to.have.property('allUsers'),
        expect(mutations).to.have.property('createUser'),
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
              fields {
                name
              }
              inputFields {
                name
              }
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
          queries = arrayToObject(__schema.queryType.fields, 'name');
          mutations = arrayToObject(__schema.mutationType.fields, 'name');
          types = arrayToObject(__schema.types, 'name', type =>
            Object.assign({}, type, {
              fields: arrayToObject(type.fields || [], 'name'),
              inputFields: arrayToObject(type.inputFields || [], 'name'),
            })
          );
        })
    );

    describe('static', () => {
      it('sanity check', () => {
        sanityCheckGraphQL();
      });

      fieldMatrix.forEach(access => {
        it(`${JSON.stringify(access)} on ${staticList}`, () => {
          const name = getFieldName(access);

          expect(types, 'types').to.have.deep.property(`${staticList}.fields`);

          const fields = types[staticList].fields;

          if (access.read) {
            expect(fields, 'fields').to.have.property(name);
          } else {
            expect(fields, 'fields').to.not.have.property(name);
          }

          // Filter types are only used when reading
          expect(types, 'WhereInput exists').to.have.deep.property(
            `${staticList}WhereInput.inputFields`
          );
          if (access.read) {
            expect(types, `WhereInput.${name} exists`).to.have.deep.property(
              `${staticList}WhereInput.inputFields.${name}`
            );
          } else {
            expect(types, `WhereInput.${name} doesn't exist`).to.not.have.deep.property(
              `${staticList}WhereInput.inputFields.${name}`
            );
          }

          // Create inputs
          expect(types, 'CreateInput exists').to.have.deep.property(
            `${staticList}CreateInput.inputFields`
          );
          if (access.create) {
            expect(types, `CreateInput.${name} exists`).to.have.deep.property(
              `${staticList}CreateInput.inputFields.${name}`
            );
          } else {
            expect(types, `CreateInput.${name} doesn't exist`).to.not.have.deep.property(
              `${staticList}CreateInput.inputFields.${name}`
            );
          }

          // Create inputs
          expect(types, 'CreateInput exists').to.have.deep.property(
            `${staticList}CreateInput.inputFields`
          );
          if (access.create) {
            expect(types, `CreateInput.${name} exists`).to.have.deep.property(
              `${staticList}CreateInput.inputFields.${name}`
            );
          } else {
            expect(types, `CreateInput.${name} doesn't exist`).to.not.have.deep.property(
              `${staticList}CreateInput.inputFields.${name}`
            );
          }

          // NOTE: There's no delete type, nor is it possible to change how one
          // would behave even if it existed since there's no `delete` access
          // control option.
        });
      });
    });

    describe('imperative', () => {
      it('sanity check', () => {
        sanityCheckGraphQL();
      });

      fieldMatrix.forEach(access => {
        it(`${JSON.stringify(access)} on ${imperativeList}`, () => {
          const name = getFieldName(access);

          expect(types, 'types').to.have.deep.property(`${imperativeList}.fields`);

          const fields = types[imperativeList].fields;

          expect(fields, 'fields').to.have.property(name);

          // Filter types are only used when reading
          expect(types, 'WhereInput exists').to.have.deep.property(
            `${imperativeList}WhereInput.inputFields`
          );
          expect(types, `WhereInput.${name} exists`).to.have.deep.property(
            `${imperativeList}WhereInput.inputFields.${name}`
          );

          // Create inputs
          expect(types, 'CreateInput exists').to.have.deep.property(
            `${imperativeList}CreateInput.inputFields`
          );
          expect(types, `CreateInput.${name} exists`).to.have.deep.property(
            `${imperativeList}CreateInput.inputFields.${name}`
          );

          // Create inputs
          expect(types, 'CreateInput exists').to.have.deep.property(
            `${imperativeList}CreateInput.inputFields`
          );
          expect(types, `CreateInput.${name} exists`).to.have.deep.property(
            `${imperativeList}CreateInput.inputFields.${name}`
          );

          // NOTE: There's no delete type, nor is it possible to change how one
          // would behave even if it existed since there's no `delete` access
          // control option.
        });
      });
    });
  });

  describe('performing actions', () => {
    describe(`static on ${staticList}`, () => {
      before(() => {
        cy.visit('/admin');
      });

      describe('create', () => {
        const createMutationName = `create${staticList}`;

        fieldMatrix.filter(({ create }) => create).forEach(access => {
          const fieldName = getFieldName(access);

          it(`allowed: ${JSON.stringify(access)}`, () => {
            cy.graphql_mutate(
              '/admin/api',
              `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id } }`
            ).then(({ data, errors }) => {
              expect(errors, 'create mutation Errors').to.equal(undefined);
              expect(
                data[createMutationName],
                `createMutation data.${createMutationName}`
              ).to.have.property('id');
            });
          });
        });
      });

      describe('read', () => {
        const allQueryName = `all${staticList}s`;
        const singleQueryName = staticList;

        fieldMatrix.filter(({ read }) => read).forEach(access => {
          const fieldName = getFieldName(access);

          it(`all allowed: ${JSON.stringify(access)}`, () => {
            cy.graphql_query('/admin/api', `query { ${allQueryName} { id ${fieldName} } }`).then(
              ({ data, errors }) => {
                expect(errors, 'no errors querying all').to.equal(undefined);
                expect(data[allQueryName], 'data when querying all').to.have.length.greaterThan(0);
              }
            );
          });

          it(`singular allowed: ${JSON.stringify(access)}`, () => {
            cy.task('mongoFind', {
              collection: staticCollection,
              query: {},
            }).then(([item]) =>
              cy
                .graphql_query(
                  '/admin/api',
                  `query { ${singleQueryName}(where: { id: "${item.id}" }) { id ${fieldName} } }`
                )
                .then(({ data, errors }) => {
                  expect(errors, 'no errors querying all').to.equal(undefined);
                  expect(data[singleQueryName], 'data when querying all').to.have.property(
                    fieldName
                  );
                })
            );
          });
        });
      });

      describe('update', () => {
        const updateMutationName = `update${staticList}`;

        fieldMatrix.filter(({ update }) => update).forEach(access => {
          const fieldName = getFieldName(access);

          it(`allowed: ${JSON.stringify(access)}`, () => {
            cy.task('mongoFind', {
              collection: staticCollection,
              query: {},
            }).then(([item]) =>
              cy
                .graphql_mutate(
                  '/admin/api',
                  `mutation { ${updateMutationName}(id: "${
                    item.id
                  }", data: { ${fieldName}: "bar" }) { id } }`
                )
                .then(({ data, errors }) => {
                  expect(errors, 'update mutation Errors').to.equal(undefined);
                  expect(
                    data[updateMutationName],
                    `updateMutation data.${updateMutationName}`
                  ).to.have.property('id');
                })
            );
          });
        });
      });
    });

    describe('imperative', () => {
      function doImperativeTests() {
        describe('create', () => {
          const createMutationName = `create${imperativeList}`;

          fieldMatrix.filter(({ create }) => create).forEach(access => {
            const fieldName = getFieldName(access);

            it(`allowed: ${JSON.stringify(access)}`, () => {
              cy.graphql_mutate(
                '/admin/api',
                `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id } }`
              ).then(({ data, errors }) => {
                expect(errors, 'create mutation Errors').to.equal(undefined);
                expect(
                  data[createMutationName],
                  `createMutation data.${createMutationName}`
                ).to.have.property('id');
              });
            });
          });

          fieldMatrix.filter(({ create }) => !create).forEach(access => {
            const fieldName = getFieldName(access);

            it(`denied: ${JSON.stringify(access)}`, () => {
              cy.graphql_mutate(
                '/admin/api',
                `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id } }`
              ).then(({ data, errors }) => {
                expect(data, 'create mutation denied').to.have.property(createMutationName, null);

                expect(errors, 'create mutation denied').to.have.deep.property(
                  '[0].name',
                  'AccessDeniedError'
                );
                expect(errors, 'create mutation denied').to.have.deep.property(
                  '[0].message',
                  'You do not have access to this resource'
                );
                expect(errors, 'create mutation denied').to.have.deep.property(
                  '[0].path[0]',
                  createMutationName
                );
              });
            });
          });
        });

        describe('read', () => {
          const allQueryName = `all${imperativeList}s`;
          const singleQueryName = imperativeList;

          fieldMatrix.filter(({ read }) => read).forEach(access => {
            const fieldName = getFieldName(access);

            it(`all allowed: ${JSON.stringify(access)}`, () => {
              cy.graphql_query('/admin/api', `query { ${allQueryName} { id ${fieldName} } }`).then(
                ({ data, errors }) => {
                  expect(errors, 'no errors querying all').to.equal(undefined);
                  expect(data[allQueryName], 'data when querying all').to.have.length.greaterThan(
                    0
                  );
                }
              );
            });

            it(`singular allowed: ${JSON.stringify(access)}`, () => {
              cy.task('mongoFind', {
                collection: imperativeCollection,
                query: {},
              }).then(([item]) =>
                cy
                  .graphql_query(
                    '/admin/api',
                    `query { ${singleQueryName}(where: { id: "${item.id}" }) { id ${fieldName} } }`
                  )
                  .then(({ data, errors }) => {
                    expect(errors, 'no errors querying all').to.equal(undefined);
                    expect(data[singleQueryName], 'data when querying all').to.have.property(
                      fieldName
                    );
                  })
              );
            });
          });

          fieldMatrix.filter(({ read }) => !read).forEach(access => {
            const fieldName = getFieldName(access);

            it(`all denied: ${JSON.stringify(access)}`, () => {
              cy.graphql_query('/admin/api', `query { ${allQueryName} { id ${fieldName} } }`).then(
                ({ data, errors }) => {
                  // All the items are returned
                  expect(data[allQueryName], 'denied query all').to.have.length.greaterThan(0);

                  // But there should be an error per item (because we don't
                  // have access to the field)
                  expect(errors, 'denied query all').to.have.length.greaterThan(0);

                  // And the values of the fields we don't have access to are
                  // null
                  data[allQueryName].forEach(item =>
                    expect(item[fieldName], 'denied query all').to.equal(null)
                  );
                }
              );
            });

            it(`singular denied: ${JSON.stringify(access)}`, () => {
              cy.task('mongoFind', {
                collection: imperativeCollection,
                query: {},
              }).then(([item]) =>
                cy
                  .graphql_query(
                    '/admin/api',
                    `query { ${singleQueryName}(where: { id: "${item.id}" }) { id ${fieldName} } }`
                  )
                  .then(({ data, errors }) => {
                    expect(data, 'read singular denied').to.have.deep.property(
                      `${singleQueryName}.${fieldName}`,
                      null
                    );

                    expect(errors, 'read singular denied').to.have.deep.property(
                      '[0].name',
                      'AccessDeniedError'
                    );
                    expect(errors, 'read singular denied').to.have.deep.property(
                      '[0].message',
                      'You do not have access to this resource'
                    );
                    expect(errors, 'read singular denied').to.have.deep.property(
                      '[0].path[0]',
                      singleQueryName
                    );
                  })
              );
            });
          });
        });

        describe('update', () => {
          const updateMutationName = `update${imperativeList}`;

          fieldMatrix.filter(({ update }) => update).forEach(access => {
            const fieldName = getFieldName(access);

            it(`allowed: ${JSON.stringify(access)}`, () => {
              cy.task('mongoFind', {
                collection: imperativeCollection,
                query: {},
              }).then(([item]) =>
                cy
                  .graphql_mutate(
                    '/admin/api',
                    `mutation { ${updateMutationName}(id: "${
                      item.id
                    }", data: { ${fieldName}: "bar" }) { id } }`
                  )
                  .then(({ data, errors }) => {
                    expect(errors, 'update mutation Errors').to.equal(undefined);
                    expect(
                      data[updateMutationName],
                      `updateMutation data.${updateMutationName}`
                    ).to.have.property('id');
                  })
              );
            });
          });

          fieldMatrix.filter(({ update }) => !update).forEach(access => {
            const fieldName = getFieldName(access);

            it(`denied: ${JSON.stringify(access)}`, () => {
              cy.task('mongoFind', {
                collection: imperativeCollection,
                query: {},
              }).then(([item]) =>
                cy
                  .graphql_mutate(
                    '/admin/api',
                    `mutation { ${updateMutationName}(id: "${
                      item.id
                    }", data: { ${fieldName}: "bar" }) { id } }`
                  )
                  .then(({ data, errors }) => {
                    expect(data, 'update mutation no data').to.have.property(
                      updateMutationName,
                      null
                    );

                    expect(errors, 'update mutation denied').to.have.deep.property(
                      '[0].name',
                      'AccessDeniedError'
                    );
                    expect(errors, 'update mutation denied').to.have.deep.property(
                      '[0].message',
                      'You do not have access to this resource'
                    );
                    expect(errors, 'update mutation denied').to.have.deep.property(
                      '[0].path[0]',
                      updateMutationName
                    );
                  })
              );
            });
          });
        });
      }

      describe('logged out', () => {
        before(() => {
          cy.visit('/admin/signout');
          cy.visit('/admin');
        });

        doImperativeTests();
      });

      describe('logged in', () => {
        stayLoggedIn('su');

        doImperativeTests();
      });
    });
  });

  describe('authenticated item', () => {
    stayLoggedIn('su');

    it('current user query returns user info', () => {
      cy.graphql_query('/admin/api', '{ authenticatedUser { id yesRead noRead } }').then(
        ({ data, errors }) => {
          expect(data).to.have.deep.property('authenticatedUser.id');
          expect(data).to.have.deep.property('authenticatedUser.yesRead', 'yes');
          expect(data).to.have.deep.property('authenticatedUser.noRead', null);
          expect(errors).to.have.length(1);
          expect(errors, 'authenticatedUser read denied').to.have.deep.property(
            '[0].name',
            'AccessDeniedError'
          );
          expect(errors, 'authenticatedUser read denied').to.have.deep.property(
            '[0].message',
            'You do not have access to this resource'
          );
          expect(errors, 'authenticatedUser read denied').to.have.deep.property('[0].path');
          expect(errors[0].path, 'authenticatedUser read denied').to.deep.equal([
            'authenticatedUser',
            'noRead',
          ]);
        }
      );
    });
  });

  describe('nullability', () => {
    stayLoggedIn('su');

    const createMutationName = `create${staticList}`;

    describe('does not throw when value not set', () => {
      fieldMatrix.filter(({ create }) => create).forEach(access => {
        const fieldName = getFieldName(access);

        it(`${JSON.stringify(access)}`, () => {
          cy.graphql_mutate(
            '/admin/api',
            `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id } }`
          ).then(({ data, errors }) => {
            expect(errors, 'create mutation Errors').to.equal(undefined);
            expect(
              data[createMutationName],
              `createMutation data.${createMutationName}`
            ).to.have.property('id');
          });
        });
      });
    });
  });
});
