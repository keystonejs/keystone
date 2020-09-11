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
  return `${name}s`.replace(/[A-Z]/g, '-$&').replace(/^-/, '').toLowerCase();
}

describe('Access Control Fields > Admin UI', () => {
  stayLoggedIn('su');

  describe('creating', () => {
    describe(`static on ${staticList}`, () => {
      const slug = listSlug(staticList);

      it('shows creatable inputs', () => {
        const fields = fieldAccessVariations.filter(({ create, read }) => create && read);
        const fieldNames = fields.map(access => getFieldName(access));

        cy.visit(`/admin/${slug}?fields=${fieldNames.join('%2C')}`);
        cy.get('#list-page-create-button').click({ force: true });
        cy.get('form[role="dialog"]').should('exist');

        fields.forEach(access => {
          const field = getFieldName(access);
          cy.get(`label[for="ks-input-${field}"]`)
            .should('exist')
            .then(() => cy.get(`#ks-input-${field}`).should('exist'));
        });
      });

      it('does not show non-creatable inputs', () => {
        const fields = fieldAccessVariations.filter(({ create, read }) => !create && read);
        const fieldNames = fields.map(access => getFieldName(access));

        cy.visit(`/admin/${slug}?fields=${fieldNames.join('%2C')}`);
        cy.get('#list-page-create-button').click({ force: true });
        cy.get('form[role="dialog"]').should('exist');

        fields.forEach(access => {
          const field = getFieldName(access);
          cy.get(`label[for="ks-input-${field}"]`)
            .should('not.exist')
            .then(() => cy.get(`#ks-input-${field}`).should('not.exist'));
        });
      });
    });

    describe('imperative', () => {
      const slug = listSlug(imperativeList);

      it('shows creatable inputs', () => {
        const fields = fieldAccessVariations.filter(({ create, read }) => create && read);
        const fieldNames = fields.map(access => getFieldName(access));

        cy.visit(`/admin/${slug}?fields=${fieldNames.join('%2C')}`);
        cy.get('#list-page-create-button').click({ force: true });
        cy.get('form[role="dialog"]').should('exist');

        fields.forEach(access => {
          const field = getFieldName(access);
          cy.get(`label[for="ks-input-${field}"]`)
            .should('exist')
            .then(() => cy.get(`#ks-input-${field}`).should('exist'));
        });
      });

      it.skip('does not show non-creatable inputs', () => {
        const fields = fieldAccessVariations.filter(({ create, read }) => !create && read);
        const fieldNames = fields.map(access => getFieldName(access));

        cy.visit(`/admin/${slug}?fields=${fieldNames.join('%2C')}`);
        cy.get('#list-page-create-button').click({ force: true });
        cy.get('form[role="dialog"]').should('exist');

        fields.forEach(access => {
          const field = getFieldName(access);
          cy.get(`label[for="ks-input-${field}"]`)
            .should('not.exist')
            .then(() => cy.get(`#ks-input-${field}`).should('not.exist'));
        });
      });
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

      it('shows readable field values on list view', () => {
        const fields = fieldAccessVariations.filter(({ read }) => read);
        const fieldNames = fields.map(access => getFieldName(access));

        cy.visit(`/admin/${slug}?fields=${fieldNames.join('%2C')}`);

        fields.forEach(access => {
          cy.get(`[data-field="${getFieldName(access)}"]`).should('exist');
          // TODO: Test value is displayed and correct
        });
      });
    });

    describe('imperative', () => {
      const slug = listSlug(imperativeList);

      it('shows readable field values on list view', () => {
        const fields = fieldAccessVariations.filter(({ read }) => read);
        const fieldNames = fields.map(access => getFieldName(access));

        cy.visit(`/admin/${slug}?fields=${fieldNames.join('%2C')}`);

        fields.forEach(access => {
          cy.get(`[data-field="${getFieldName(access)}"]`).should('exist');
          // TODO: Test value is displayed and correct
        });
      });

      it.skip('does not show item value of non-readable fields', () => {
        const fields = fieldAccessVariations.filter(({ read }) => !read);
        const fieldNames = fields.map(access => getFieldName(access));

        cy.visit(`/admin/${slug}?fields=${fieldNames.join('%2C')}`);

        fields.forEach(access => {
          cy.get(`[data-field="${getFieldName(access)}"]`).should('not.exist');
        });
      });
    });
  });

  describe('updating', () => {
    function updateFromListViewTests(listName) {
      describe(`list view multi-update on list ${listName}`, () => {
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
      const slug = listSlug(staticList);
      const queryName = `all${staticList}s`;

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

      it('shows non-updatable inputs as disabled', () => {
        fieldAccessVariations
          .filter(({ update, read }) => !update && read)
          .forEach(access => {
            const field = getFieldName(access);
            cy.get(`label[for="ks-input-${field}"]`)
              .should('exist')
              .then(() => cy.get(`#ks-input-${field}`).should('be.disabled'));
          });
      });

      updateFromListViewTests(staticList);
    });

    describe(`imperative on ${imperativeList}`, () => {
      const slug = listSlug(imperativeList);
      const queryName = `all${imperativeList}s`;

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

      it.skip('shows non-updatable inputs as disabled', () => {
        fieldAccessVariations
          .filter(({ update, read }) => !update && read)
          .forEach(access => {
            const field = getFieldName(access);
            cy.get(`label[for="ks-input-${field}"]`)
              .should('exist')
              .then(() => cy.get(`#ks-input-${field}`).should('be.disabled'));
          });
      });

      updateFromListViewTests(imperativeList);
    });
  });
});
