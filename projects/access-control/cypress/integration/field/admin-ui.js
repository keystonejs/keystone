/* eslint-disable jest/valid-expect */
const {
  getStaticListName,
  getDynamicListName,
  accessCombinations,
  stayLoggedIn,
} = require('../util');

function listSlug(name) {
  return `${name}s`
    .replace(/[A-Z]/g, '-$&')
    .replace(/^-/, '')
    .toLowerCase();
}

describe('Access Control Fields > Admin UI', () => {
  // Will become:
  // {
  //   "User": {
  //     "name": "String",
  //     "email": "String",
  //   },
  // }
  let listFields;

  before(() => {
    cy.visit('/admin');
    cy
      .graphql_query(
        '/admin/api',
        `{
        __schema {
          types {
            name
            fields {
              name
              type {
                name
              }
            }
          }
        }
      }`
      )
      .then(({ data: { __schema: { types } } }) => {
        function toObject(arr, func) {
          return (arr || []).reduce(
            (memo, field) => Object.assign(memo, func(field)),
            {}
          );
        }

        listFields = toObject(types, type => ({
          [type.name]: toObject(type.fields, field => ({
            [field.name]: field.type.name,
          })),
        }));
      });
  });

  describe('creating', () => {
    describe('static', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      accessCombinations
        .filter(({ create, read }) => create && read)
        .forEach(access => {
          it(`shows creatable fields: ${JSON.stringify(access)}`, () => {
            const name = getStaticListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            cy
              .graphql_query(
                '/admin/api',
                `query { ${queryName}(first: 1) { id } }`
              )
              .then(({ data }) =>
                cy.visit(`/admin/${slug}/${data[queryName][0].id}`)
              );

            cy.get('button[appearance="create"]').should('exist');
          });
        });

      accessCombinations
        .filter(({ create, read }) => !create && read)
        .forEach(access => {
          it(`does not show fields when not creatable: ${JSON.stringify(
            access
          )}`, () => {
            const name = getStaticListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            cy
              .graphql_query(
                '/admin/api',
                `query { ${queryName}(first: 1) { id } }`
              )
              .then(({ data }) =>
                cy.visit(`/admin/${slug}/${data[queryName][0].id}`)
              );

            cy.get('button[appearance="create"]').should('not.exist');
          });
        });
    });

    describe('dynamic', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      accessCombinations
        .filter(({ create, read }) => create && read)
        .forEach(access => {
          it(`shows create option when at least one field creatable (list view): ${JSON.stringify(
            access
          )}`, () => {
            // NOTE: This is different from the test in List where it is testing
            // the List-level permissions. Here, we are testing the field-level
            // permissions
            // TODO
          });

          it(`shows create option when at least one field creatable (item view): ${JSON.stringify(
            access
          )}`, () => {
            const name = getDynamicListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            cy
              .graphql_query(
                '/admin/api',
                `query { ${queryName}(first: 1) { id } }`
              )
              .then(({ data }) =>
                cy.visit(`/admin/${slug}/${data[queryName][0].id}`)
              );
            cy.get('button[appearance="create"]').should('exist');
          });
        });

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      accessCombinations
        .filter(({ create, read }) => create && read)
        .forEach(access => {
          it.skip(`does not show create option when no fields are creatable (list view): ${JSON.stringify(
            access
          )}`, () => {
            // NOTE: This is different from the test in List where it is testing
            // the List-level permissions. Here, we are testing the field-level
            // permissions
            // TODO
          });

          it.skip(`does not show create option when no fields are creatable (item view): ${JSON.stringify(
            access
          )}`, () => {
            const name = getDynamicListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            cy
              .graphql_query(
                '/admin/api',
                `query { ${queryName}(first: 1) { id } }`
              )
              .then(({ data }) =>
                cy.visit(`/admin/${slug}/${data[queryName][0].id}`)
              );

            cy.get('button[appearance="create"]').should('exist');
          });
        });
    });
  });

  describe('updating', () => {
    describe('static', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      accessCombinations
        .filter(({ update, read }) => update && read)
        .forEach(access => {
          it(`shows updatable fields as inputs: ${JSON.stringify(
            access
          )}`, () => {
            const name = getStaticListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            cy
              .graphql_query(
                '/admin/api',
                `query { ${queryName}(first: 1) { id } }`
              )
              .then(({ data }) =>
                cy.visit(`/admin/${slug}/${data[queryName][0].id}`)
              );

            Object.entries(listFields[name])
              // Ignore the non-editable types
              .filter(([field]) => !['id', '_label_'].includes(field))
              .map(([field]) => {
                cy
                  .get(`label[for="ks-input-${field}"]`)
                  .should('exist')
                  .then(() => cy.get(`#ks-input-${field}`).should('exist'));
              });
          });
        });

      accessCombinations
        .filter(({ update, read }) => !update && read)
        .forEach(access => {
          it.skip(`does not show input fields when not updatable: ${JSON.stringify(
            access
          )}`, () => {
            const name = getStaticListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            cy
              .graphql_query(
                '/admin/api',
                `query { ${queryName}(first: 1) { id } }`
              )
              .then(({ data }) =>
                cy.visit(`/admin/${slug}/${data[queryName][0].id}`)
              );

            Object.entries(listFields[name])
              // Ignore the non-editable types
              .filter(([field]) => !['id', '_label_'].includes(field))
              .map(([field]) => {
                cy
                  .get(`label[for="ks-input-${field}"]`)
                  .should('exist')
                  .then(() => cy.get(`#ks-input-${field}`).should('not.exist'));
              });

            // TODO: Check for "Save Changes" & "Reset Changes" buttons
          });
        });
    });

    describe('dynamic', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      accessCombinations
        .filter(({ create, read }) => create && read)
        .forEach(access => {
          it(`shows update option when updatable: ${JSON.stringify(
            access
          )}`, () => {
            // TODO Same as static above
          });
        });
    });
    /*
    it.skip('shows update item option when updatable', () => {

    });

    it.skip('shows multi-update option when updatable', () => {

    });

    it.skip('does not show update item option when not updatable', () => {

    });

    it.skip('does not show the multi-update option when not updatable', () => {

    });
    */
  });

  describe('deleting', () => {
    it.skip('shows delete item option when deletable', () => {});

    it.skip('shows multi-delete option when deletable', () => {});

    it.skip('does not show delete item option when not deletable', () => {});

    it.skip('does not show the multi-delete option when not deletable', () => {});
  });
});
