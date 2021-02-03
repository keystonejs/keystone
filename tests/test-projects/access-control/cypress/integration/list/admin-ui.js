/* eslint-disable jest/valid-expect */
const {
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  listAccessVariations,
  stayLoggedIn,
} = require('../util');

function prettyListName(name) {
  return name.replace(/[A-Z]/g, ' $&').trim();
}

function listSlug(name) {
  return `${name}s`.replace(/[A-Z]/g, '-$&').replace(/^-/, '').toLowerCase();
}

describe('Access Control Lists > Admin UI', () => {
  describe('Visibility', () => {
    describe('static config', () => {
      stayLoggedIn('su');

      it(`is not visible when not readable`, () => {
        const access = listAccessVariations.find(({ read }) => !read);
        const name = getStaticListName(access);
        const slug = `${name.toLowerCase()}s`;

        // When statically `read: false && create: false`, should not show
        // in the nav or main page, or have a route (ie; the admin ui shouldn't
        // know about it at all)
        cy.get('body').should('not.contain', name);

        cy.visit(`admin/${slug}`);

        cy.get('body').should('contain', `The list “${slug}” does not exist`);
      });

      it(`is visible when readable`, () => {
        const access = listAccessVariations.find(({ read }) => read);
        const name = getStaticListName(access);
        const prettyName = prettyListName(name);
        const slug = listSlug(name);

        // TODO: Check body text too
        cy.get('body nav').should('contain', prettyName);

        cy.visit(`/admin/${slug}`);

        cy.get('body').should('not.contain', `The list “${slug}” does not exist`);
        cy.get('body h1').should('contain', prettyName);
      });
    });

    describe('read: imperative config', () => {
      stayLoggedIn('su');

      it(`shows items when readable`, () => {
        const access = listAccessVariations.find(({ read }) => read);
        const name = getImperativeListName(access);
        const prettyName = prettyListName(name);
        const slug = listSlug(name);

        cy.get('body nav').should('contain', prettyName);

        cy.visit(`admin/${slug}`);

        cy.get('body').should('not.contain', 'You do not have access to this resource');
        cy.get('body h1').should('contain', prettyName);

        // TODO: Check for list of items too
      });

      it(`shows an access restricted message when not readable`, () => {
        const access = listAccessVariations.find(({ read }) => !read);
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

    describe('read: declarative config', () => {
      stayLoggedIn('su');

      it(`shows items when readable`, () => {
        const access = listAccessVariations.find(({ read }) => read);
        const name = getDeclarativeListName(access);
        const prettyName = prettyListName(name);
        const slug = listSlug(name);

        cy.get('body nav').should('contain', prettyName);

        cy.visit(`admin/${slug}`);

        cy.get('body').should('not.contain', 'You do not have access to this resource');
        cy.get('body h1').should('contain', prettyName);

        // TODO: Check for list of items too
      });

      it(`shows an access restricted message when not readable`, () => {
        const access = listAccessVariations.find(({ read }) => !read);
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

    describe('read: declarative', () => {
      describe('admin', () => {
        stayLoggedIn('su');

        it(`shows items when readable & admin`, () => {
          const access = listAccessVariations.find(({ read }) => read);
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

      describe('non-admin', () => {
        stayLoggedIn('reader');

        it(`does not show items when readable & not admin`, () => {
          const access = listAccessVariations.find(({ read }) => read);

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

  describe('creating', () => {
    describe('static', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      it(`shows create option when creatable (list view)`, () => {
        const access = listAccessVariations.find(({ create, read }) => create && read);
        const name = getStaticListName(access);
        const slug = listSlug(name);

        cy.visit(`admin/${slug}`);

        cy.get('#list-page-create-button').should('exist');
      });

      it(`shows create option when creatable (item view)`, () => {
        const access = listAccessVariations.find(({ create, read }) => create && read);

        const name = getStaticListName(access);
        const queryName = `all${name}s`;
        const slug = listSlug(name);

        return cy
          .graphql_query('/admin/api', `query { ${queryName}(first: 1) { id } }`)
          .then(({ data }) =>
            cy
              .visit(`/admin/${slug}/${data[queryName][0].id}`)
              .then(() => cy.get('#item-page-create-button').should('exist'))
          );
      });

      it(`does not show create option when not creatable (list view)}`, () => {
        const access = listAccessVariations.find(({ create, read }) => !create && read);
        const name = getStaticListName(access);
        const slug = listSlug(name);

        cy.visit(`admin/${slug}`);

        cy.get('#list-page-create-button').should('not.exist');
      });

      it(`does not show create option when not creatable (item view)`, () => {
        const access = listAccessVariations.find(({ create, read }) => !create && read);

        const name = getStaticListName(access);
        const queryName = `all${name}s`;
        const slug = listSlug(name);

        return cy
          .graphql_query('/admin/api', `query { ${queryName}(first: 1) { id } }`)
          .then(({ data }) =>
            cy
              .visit(`/admin/${slug}/${data[queryName][0].id}`)
              .then(() => cy.get('#item-page-create-button').should('not.exist'))
          );
      });
    });

    describe('imperative', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      it(`shows create option when creatable (list view)`, () => {
        const access = listAccessVariations.find(({ create, read }) => create && read);
        const name = getImperativeListName(access);
        const slug = listSlug(name);

        cy.visit(`admin/${slug}`);

        // Always shows create button, regardless of dynamic permission result.
        // ie; The UI has no way of executing the graphql-side permission
        // query, so must always show the option until the user submits a
        // graphql request.
        cy.get('#list-page-create-button').should('exist');
      });

      it(`shows create option when creatable (item view)`, () => {
        const access = listAccessVariations.find(({ create, read }) => create && read);

        const name = getImperativeListName(access);
        const queryName = `all${name}s`;
        const slug = listSlug(name);

        return cy
          .graphql_query('/admin/api', `query { ${queryName}(first: 1) { id } }`)
          .then(({ data }) =>
            cy
              .visit(`/admin/${slug}/${data[queryName][0].id}`)
              .then(() => cy.get('#item-page-create-button').should('exist'))
          );
      });
    });

    describe('declarative', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      it(`shows create option when creatable (list view)`, () => {
        const access = listAccessVariations.find(({ create, read }) => create && read);
        const name = getDeclarativeListName(access);
        const slug = listSlug(name);

        cy.visit(`admin/${slug}`);

        // Always shows create button, regardless of dynamic permission result.
        // ie; The UI has no way of executing the graphql-side permission
        // query, so must always show the option until the user submits a
        // graphql request.
        cy.get('#list-page-create-button').should('exist');
      });

      it(`shows create option when creatable (item view)`, () => {
        const access = listAccessVariations.find(({ create, read }) => create && read);

        const name = getDeclarativeListName(access);
        const queryName = `all${name}s`;
        const slug = listSlug(name);

        return cy
          .graphql_query('/admin/api', `query { ${queryName}(first: 1) { id } }`)
          .then(({ data }) =>
            cy
              .visit(`/admin/${slug}/${data[queryName][0].id}`)
              .then(() => cy.get('#item-page-create-button').should('exist'))
          );
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
      it(`shows update option when updatable (list view)`, () => {
        const access = listAccessVariations.find(({ update, read }) => update && read);
        const name = getStaticListName(access);
        const slug = listSlug(name);

        cy.visit(`admin/${slug}`);

        cy.get('#ks-list-table > [data-test-table-loaded=true]');

        // The first label inside thead wraps a visibly-hidden checkbox which
        // cypress can't find
        cy.get('#ks-list-table > thead label')
          .first()
          // It's there, it's visible in the recordings, but Cypress
          // _sometimes_ refuses to click it.
          // See an image of it incorrectly failing here:
          // https://17679-128193054-gh.circle-artifacts.com/0/tmp/screenshots/list/admin-ui.js/Access%20Control%20Lists%20%20Admin%20UI%20--%20updating%20--%20static%20--%20does%20not%20show%20update%20option%20when%20not%20updatable%20%28list%20view%29%20%7Bcreatefalse%2Creadtrue%2Cupdatefalse%2Cdeletefalse%7D%20%28failed%29.png
          .click({ force: true });
        cy.get('button[data-test-name="update"]').should('exist');
      });

      it(`shows update option when updatable (item view)`, () => {
        const access = listAccessVariations.find(({ update, read }) => update && read);

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

      it(`does not show update option when not updatable (list view)`, () => {
        const access = listAccessVariations.find(({ update, read }) => !update && read);
        const name = getStaticListName(access);
        const slug = listSlug(name);

        cy.visit(`admin/${slug}`);

        cy.get('#ks-list-table > [data-test-table-loaded=true]');

        // The first label inside thead wraps a visibly-hidden checkbox which
        // cypress can't find
        cy.get('#ks-list-table > thead label')
          .first()
          // It's there, it's visible in the recordings, but Cypress
          // _sometimes_ refuses to click it.
          // See an image of it incorrectly failing here:
          // https://17679-128193054-gh.circle-artifacts.com/0/tmp/screenshots/list/admin-ui.js/Access%20Control%20Lists%20%20Admin%20UI%20--%20updating%20--%20static%20--%20does%20not%20show%20update%20option%20when%20not%20updatable%20%28list%20view%29%20%7Bcreatefalse%2Creadtrue%2Cupdatefalse%2Cdeletefalse%7D%20%28failed%29.png
          .click({ force: true });
        cy.get('button[data-test-name="update"]').should('not.exist');
      });

      it(`does not show input fields when not updatable (item view)`, () => {
        const access = listAccessVariations.find(({ update, read }) => !update && read);
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

    describe('imperative', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      it(`shows create option when creatable`, () => {
        const access = listAccessVariations.find(({ create, read }) => create && read);
        const name = getImperativeListName(access);
        const slug = listSlug(name);

        cy.visit(`admin/${slug}`);

        // Always shows create button, regardless of dynamic permission result.
        // ie; The UI has no way of executing the graphql-side permission
        // query, so must always show the option until the user submits a
        // graphql request.
        cy.get('#list-page-create-button').should('exist');
      });
    });

    describe('declarative', () => {
      stayLoggedIn('su');

      // NOTE: We only check lists that are readable as we've checked that
      // non-readable lists show access denied above
      it(`shows create option when creatable`, () => {
        const access = listAccessVariations.find(({ create, read }) => create && read);
        const name = getDeclarativeListName(access);
        const slug = listSlug(name);

        cy.visit(`admin/${slug}`);

        // Always shows create button, regardless of dynamic permission result.
        // ie; The UI has no way of executing the graphql-side permission
        // query, so must always show the option until the user submits a
        // graphql request.
        cy.get('#list-page-create-button').should('exist');
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
