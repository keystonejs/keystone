/* eslint-disable jest/valid-expect */
const {
  getStaticListName,
  getImperativeListName,
  fieldAccessVariations,
  getFieldName,
  stayLoggedIn,
} = require('../util');

const staticList = getStaticListName({
  create: true,
  read: true,
  update: true,
  delete: true,
});

const imperativeList = getImperativeListName({
  create: true,
  read: true,
  update: true,
  delete: true,
});

function listSlug(name) {
  return `${name}s`
    .replace(/[A-Z]/g, '-$&')
    .replace(/^-/, '')
    .toLowerCase();
}

describe('Access Control Fields > Admin UI', () => {
  stayLoggedIn('su');

  describe('creating', () => {
    function createTests(listName) {
      const slug = listSlug(listName);

      before(() => {
        cy.visit(`/admin/${slug}`);
        cy.get('#list-page-create-button').click();
        cy.get('form[role="dialog"]').should('exist');
      });

      it('shows creatable inputs', () => {
        fieldAccessVariations
          .filter(({ create, read }) => create && read)
          .forEach(access => {
            const field = getFieldName(access);
            cy.get(`label[for="ks-input-${field}"]`)
              .should('exist')
              .then(() => cy.get(`#ks-input-${field}`).should('exist'));
          });
      });

      // Skipped until Admin UI is created to exclude these fields
      it.skip('does not show non-creatable inputs', () => {
        fieldAccessVariations
          .filter(({ create, read }) => !create && read)
          .forEach(access => {
            const field = getFieldName(access);
            cy.get(`label[for="ks-input-${field}"]`)
              .should('exist')
              .then(() => cy.get(`#ks-input-${field}`).should('not.exist'));
          });
      });
    }

    describe(`static on ${staticList}`, () => {
      createTests(staticList);
    });

    describe('imperative', () => {
      createTests(imperativeList);
    });
  });

  describe('reading', () => {
    // We've consciously made a design choice that the `read` permission on a
    // list is a master switch in the Admin UI (not the GraphQL API).
    // Justification: If you want to Create without the Read permission, you
    // technically don't have permission to read the result of your creation.
    // If you want to Update an item, you can't see what the current values
    // are. If you want to delete an item, you'd need to be given direct
    // access to it (direct URI), but can't see anything about that item. And
    // in fact, being able to load a page with a 'delete' button on it
    // violates the read permission as it leaks the fact that item exists.
    // In all these cases, the Admin UI becomes unnecessarily complex.
    // So we only allow all these actions if you also have read access.

    describe(`static on ${staticList}`, () => {
      const slug = listSlug(staticList);

      // Skipped until we can force the Admin UI to show all the columns we need
      it.skip('shows readable field values on list view', () => {
        cy.visit(`/admin/${slug}`);
        fieldAccessVariations
          .filter(({ read }) => read)
          .forEach(access => {
            cy.get(`[data-field="${getFieldName(access)}"]`).should('exist');
            // TODO: Test value is displayed and correct
          });
      });
    });

    describe('imperative', () => {
      const slug = listSlug(imperativeList);

      // Skipped until we can force the Admin UI to show all the columns we need
      it.skip('shows readable field values on list view', () => {
        cy.visit(`/admin/${slug}`);
        fieldAccessVariations
          .filter(({ read }) => read)
          .forEach(access => {
            cy.get(`[data-field="${getFieldName(access)}"]`).should('exist');
            // TODO: Test value is displayed and correct
          });
      });

      // Skipped until Admin UI is updated to exclude these fields
      it.skip('does not show item value of non-readable fields', () => {
        fieldAccessVariations
          .filter(({ read }) => !read)
          .forEach(access => {
            cy.get(`[data-field="${getFieldName(access)}"]`).should('exist');
          });
      });
    });
  });

  describe('updating', () => {
    function updateTests(listName) {
      const slug = listSlug(listName);
      const queryName = `all${listName}s`;

      before(() => {
        cy.graphql_query('/admin/api', `query { ${queryName}(first: 1) { id } }`).then(
          ({ data }) => {
            cy.visit(`/admin/${slug}/${data[queryName][0].id}`);
            cy.get('form').should('exist');
          }
        );
      });

      it('shows updatable inputs', () => {
        fieldAccessVariations
          .filter(({ update, read }) => update && read)
          .forEach(access => {
            const field = getFieldName(access);
            cy.get(`label[for="ks-input-${field}"]`)
              .should('exist')
              .then(() => cy.get(`#ks-input-${field}`).should('exist'));
          });
      });

      // Skipped until Admin UI hides these fields
      it.skip('does not show non-updatable inputs', () => {
        fieldAccessVariations
          .filter(({ update, read }) => !update && read)
          .forEach(access => {
            const field = getFieldName(access);
            cy.get(`label[for="ks-input-${field}"]`)
              .should('exist')
              .then(() => cy.get(`#ks-input-${field}`).should('not.exist'));
          });
      });
    }

    function updateFromListViewTests() {
      describe('list view multi-update', () => {
        it.skip('shows only the fields commonly updatable across all selected items', () => {
          // TODO: Setup access control so that it's something like this:
          //
          // | Is Updatable | foo | bar | zip |
          // |--------------|-----|-----|-----|
          // | Item 1       |  ✓  |     |  ✓  |
          // | Item 2       |     |  ✓  |  ✓  |
          //
          // And check that the updatable fields are the intersection (ie; only
          // 'zip' in this case)
        });
      });
    }

    describe(`static on ${staticList}`, () => {
      updateTests(staticList);
      updateFromListViewTests(staticList);
    });

    describe(`imperative on ${imperativeList}`, () => {
      updateTests(imperativeList);
      updateFromListViewTests(imperativeList);
    });
  });
});
