/* eslint-disable jest/valid-expect */
const {
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  listAccessVariations,
  stayLoggedIn,
} = require('../util');

function prettyListName(name) {
  return `${name}s`.replace(/[A-Z]/g, ' $&').trim();
}

function listSlug(name) {
  return `${name}s`
    .replace(/[A-Z]/g, '-$&')
    .replace(/^-/, '')
    .toLowerCase();
}

describe('Access Control Lists > Admin UI', () => {
  describe('Visibility', () => {
    describe('static config', () => {
      stayLoggedIn('su');

      listAccessVariations
        .filter(({ read }) => !read)
        .forEach(access => {
          it(`is not visible when not readable: ${JSON.stringify(access)}`, () => {
            const name = getStaticListName(access);
            const slug = `${name.toLowerCase()}s`;

            // When statically `read: false && create: false`, should not show
            // in the nav or main page, or have a route (ie; the admin ui shouldn't
            // know about it at all)
            cy.get('body').should('not.contain', name);

            cy.visit(`admin/${slug}`);

            cy.get('body').should('contain', `The list “${slug}” doesn't exist`);
          });
        });

      listAccessVariations
        .filter(({ read }) => read)
        .forEach(access => {
          it(`is visible when readable: ${JSON.stringify(access)}`, () => {
            const name = getStaticListName(access);
            const prettyName = prettyListName(name);
            const slug = listSlug(name);

            // TODO: Check body text too
            cy.get('body nav').should('contain', prettyName);

            cy.visit(`/admin/${slug}`);

            cy.get('body').should('not.contain', `The list “${slug}” doesn't exist`);
            cy.get('body h1').should('contain', prettyName);
          });
        });
    });

    describe('read: imperative config', () => {
      stayLoggedIn('su');

      listAccessVariations
        .filter(({ read }) => read)
        .forEach(access => {
          it(`shows items when readable: ${JSON.stringify(access)}`, () => {
            const name = getImperativeListName(access);
            const prettyName = prettyListName(name);
            const slug = listSlug(name);

            cy.get('body nav').should('contain', prettyName);

            cy.visit(`admin/${slug}`);

            cy.get('body').should('not.contain', 'You do not have access to this resource');
            cy.get('body h1').should('contain', prettyName);

            // TODO: Check for list of items too
          });
        });

      listAccessVariations
        .filter(({ read }) => !read)
        .forEach(access => {
          it(`shows an access restricted message when not readable: ${JSON.stringify(
            access
          )}`, () => {
            const name = getImperativeListName(access);
            const prettyName = prettyListName(name);
            const slug = listSlug(name);

            // Still navigable
            cy.get('body nav').should('contain', prettyName);

            cy.visit(`admin/${slug}`);

            // But shows an error on attempt to read
            cy.get('body').should('contain', 'You do not have access to this resource');

            // TODO: Check no items shown too
          });
        });
    });

    describe('read: declarative config', () => {
      stayLoggedIn('su');

      listAccessVariations
        .filter(({ read }) => read)
        .forEach(access => {
          it(`shows items when readable: ${JSON.stringify(access)}`, () => {
            const name = getDeclarativeListName(access);
            const prettyName = prettyListName(name);
            const slug = listSlug(name);

            cy.get('body nav').should('contain', prettyName);

            cy.visit(`admin/${slug}`);

            cy.get('body').should('not.contain', 'You do not have access to this resource');
            cy.get('body h1').should('contain', prettyName);

            // TODO: Check for list of items too
          });
        });

      listAccessVariations
        .filter(({ read }) => !read)
        .forEach(access => {
          it(`shows an access restricted message when not readable: ${JSON.stringify(
            access
          )}`, () => {
            const name = getDeclarativeListName(access);
            const prettyName = prettyListName(name);
            const slug = listSlug(name);

            // Still navigable
            cy.get('body nav').should('contain', prettyName);

            cy.visit(`admin/${slug}`);

            // But shows an error on attempt to read
            cy.get('body').should('contain', 'You do not have access to this resource');

            // TODO: Check no items shown too
          });
        });
    });

    describe('read: declarative', () => {
      describe('admin', () => {
        stayLoggedIn('su');

        listAccessVariations
          .filter(({ read }) => read)
          .forEach(access => {
            it(`shows items when readable & admin: ${JSON.stringify(access)}`, () => {
              const name = getDeclarativeListName(access);
              const prettyName = prettyListName(name);
              const slug = listSlug(name);

              cy.get('body nav').should('contain', prettyName);

              cy.visit(`admin/${slug}`);

              cy.get('body').should('not.contain', 'You do not have access to this resource');
              cy.get('body h1').should('contain', prettyName);

              // TODO: Check for list of items too
            });
          });
      });

      describe('non-admin', () => {
        stayLoggedIn('reader');

        listAccessVariations
          .filter(({ read }) => read)
          .forEach(access => {
            it(`does not show items when readable & not admin: ${JSON.stringify(access)}`, () => {
              const name = getDeclarativeListName(access);
              const prettyName = prettyListName(name);
              const slug = listSlug(name);

              // Still navigable
              cy.get('body nav').should('contain', prettyName);

              cy.visit(`admin/${slug}`);

              // But shows an error on attempt to read
              cy.get('body').should('contain', 'You do not have access to this resource');

              // TODO: Check no items shown too
            });
          });
      });
    });
  });

  describe('creating', () => {
    describe('static', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      listAccessVariations
        .filter(({ create, read }) => create && read)
        .forEach(access => {
          it(`shows create option when creatable (list view): ${JSON.stringify(access)}`, () => {
            const name = getStaticListName(access);
            const slug = listSlug(name);

            cy.visit(`admin/${slug}`);

            cy.get('button[appearance="create"]').should('exist');
          });

          it(`shows create option when creatable (item view): ${JSON.stringify(access)}`, () => {
            const name = getStaticListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            return cy
              .graphql_query('/admin/api', `query { ${queryName}(first: 1) { id } }`)
              .then(({ data }) =>
                cy
                  .visit(`/admin/${slug}/${data[queryName][0].id}`)
                  .then(() => cy.get('button[appearance="create"]').should('exist'))
              );
          });
        });

      listAccessVariations
        .filter(({ create, read }) => !create && read)
        .forEach(access => {
          it(`does not show create option when not creatable (list view): ${JSON.stringify(
            access
          )}`, () => {
            const name = getStaticListName(access);
            const slug = listSlug(name);

            cy.visit(`admin/${slug}`);

            cy.get('button[appearance="create"]').should('not.exist');
          });

          it(`does not show create option when not creatable (item view): ${JSON.stringify(
            access
          )}`, () => {
            const name = getStaticListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            return cy
              .graphql_query('/admin/api', `query { ${queryName}(first: 1) { id } }`)
              .then(({ data }) =>
                cy
                  .visit(`/admin/${slug}/${data[queryName][0].id}`)
                  .then(() => cy.get('button[appearance="create"]').should('not.exist'))
              );
          });
        });
    });

    describe('imperative', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      listAccessVariations
        .filter(({ create, read }) => create && read)
        .forEach(access => {
          it(`shows create option when creatable (list view): ${JSON.stringify(access)}`, () => {
            const name = getImperativeListName(access);
            const slug = listSlug(name);

            cy.visit(`admin/${slug}`);

            // Always shows create button, regardless of dynamic permission result.
            // ie; The UI has no way of executing the graphql-side permission
            // query, so must always show the option until the user submits a
            // graphql request.
            cy.get('button[appearance="create"]').should('exist');
          });

          it(`shows create option when creatable (item view): ${JSON.stringify(access)}`, () => {
            const name = getImperativeListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            return cy
              .graphql_query('/admin/api', `query { ${queryName}(first: 1) { id } }`)
              .then(({ data }) =>
                cy
                  .visit(`/admin/${slug}/${data[queryName][0].id}`)
                  .then(() => cy.get('button[appearance="create"]').should('exist'))
              );
          });
        });
    });

    describe('declarative', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      listAccessVariations
        .filter(({ create, read }) => create && read)
        .forEach(access => {
          it(`shows create option when creatable (list view): ${JSON.stringify(access)}`, () => {
            const name = getDeclarativeListName(access);
            const slug = listSlug(name);

            cy.visit(`admin/${slug}`);

            // Always shows create button, regardless of dynamic permission result.
            // ie; The UI has no way of executing the graphql-side permission
            // query, so must always show the option until the user submits a
            // graphql request.
            cy.get('button[appearance="create"]').should('exist');
          });

          it(`shows create option when creatable (item view): ${JSON.stringify(access)}`, () => {
            const name = getDeclarativeListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            return cy
              .graphql_query('/admin/api', `query { ${queryName}(first: 1) { id } }`)
              .then(({ data }) =>
                cy
                  .visit(`/admin/${slug}/${data[queryName][0].id}`)
                  .then(() => cy.get('button[appearance="create"]').should('exist'))
              );
          });
        });
    });
  });

  describe('updating', () => {
    it('shows update item option when updatable', () => {});

    it('shows multi-update option when updatable', () => {});

    it('does not show update item option when not updatable', () => {});

    it('does not show the multi-update option when not updatable', () => {});

    describe('static', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      listAccessVariations
        .filter(({ update, read }) => update && read)
        .forEach(access => {
          it(`shows update option when updatable (list view): ${JSON.stringify(access)}`, () => {
            const name = getStaticListName(access);
            const slug = listSlug(name);

            cy.visit(`admin/${slug}`);

            // The first label inside thead wraps a visibly-hidden checkbox which
            // cypress can't find
            cy.get('#ks-list-table > thead label')
              .first()
              .click();
            cy.get('button[data-test-name="update"]').should('exist');
          });

          it(`shows update option when updatable (item view): ${JSON.stringify(access)}`, () => {
            const name = getStaticListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            return cy
              .graphql_query('/admin/api', `query { ${queryName}(first: 1) { id } }`)
              .then(({ data }) => {
                cy.visit(`/admin/${slug}/${data[queryName][0].id}`);
                // TODO: Check for "Save Changes" & "Reset Changes" buttons
              });
          });
        });

      listAccessVariations
        .filter(({ update, read }) => !update && read)
        .forEach(access => {
          it(`does not show update option when not updatable (list view): ${JSON.stringify(
            access
          )}`, () => {
            const name = getStaticListName(access);
            const slug = listSlug(name);

            cy.visit(`admin/${slug}`);

            // The first label inside thead wraps a visibly-hidden checkbox which
            // cypress can't find
            cy.get('#ks-list-table > thead label')
              .first()
              .click();
            cy.get('button[data-test-name="update"]').should('not.exist');
          });

          it(`does not show input fields when not updatable (item view): ${JSON.stringify(
            access
          )}`, () => {
            const name = getStaticListName(access);
            const queryName = `all${name}s`;
            const slug = listSlug(name);

            return cy
              .graphql_query('/admin/api', `query { ${queryName}(first: 1) { id } }`)
              .then(({ data }) => {
                cy.visit(`/admin/${slug}/${data[queryName][0].id}`);
                // TODO: Check for "Save Changes" & "Reset Changes" buttons
              });
          });
        });
    });

    describe('imperative', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      listAccessVariations
        .filter(({ create, read }) => create && read)
        .forEach(access => {
          it(`shows create option when creatable: ${JSON.stringify(access)}`, () => {
            const name = getImperativeListName(access);
            const slug = listSlug(name);

            cy.visit(`admin/${slug}`);

            // Always shows create button, regardless of dynamic permission result.
            // ie; The UI has no way of executing the graphql-side permission
            // query, so must always show the option until the user submits a
            // graphql request.
            cy.get('button[appearance="create"]').should('exist');
          });
        });
    });

    describe('declarative', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      listAccessVariations
        .filter(({ create, read }) => create && read)
        .forEach(access => {
          it(`shows create option when creatable: ${JSON.stringify(access)}`, () => {
            const name = getDeclarativeListName(access);
            const slug = listSlug(name);

            cy.visit(`admin/${slug}`);

            // Always shows create button, regardless of dynamic permission result.
            // ie; The UI has no way of executing the graphql-side permission
            // query, so must always show the option until the user submits a
            // graphql request.
            cy.get('button[appearance="create"]').should('exist');
          });
        });
    });
  });

  describe('deleting', () => {
    it('shows delete item option when deletable', () => {});

    it('shows multi-delete option when deletable', () => {});

    it('does not show delete item option when not deletable', () => {});

    it('does not show the multi-delete option when not deletable', () => {});
  });
});
