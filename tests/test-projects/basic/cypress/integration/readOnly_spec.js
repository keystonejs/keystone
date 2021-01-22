const path = '/admin/users?fields=_label_%2Cdob%2ClastOnline';

const getCellFromSecondRow = index =>
  `#ks-list-table tbody > tr:nth-child(2) > td:nth-child(${index})`;

describe('ReadOnly Fields', () => {
  it('Ensure readonly fields are rendered as disabled', () => {
    cy.visit('/admin/read-only-lists');

    cy.get('a[href^="/admin/read-only-lists/"]:first').click({ force: true });

    // FIXME: Add price when we have Decimal support in prisma https://github.com/keystonejs/keystone/issues/4702
    // ['slug', 'status', 'author', 'views', 'price', 'currency', 'hero'].forEach(field => {
    ['slug', 'status', 'author', 'views', 'currency', 'hero'].forEach(field => {
      cy.get(`label[for="ks-input-${field}"]`)
        .should('exist')
        .then(() => cy.get(`#ks-input-${field}`).should('be.disabled'));
    });

    // markdown field rendering
    cy.get(`label[for="ks-input-markdownValue"]`)
      .should('exist')
      .then($label => {
        cy.get($label)
          .next()
          .within(() => {
            cy.get('button').should('be.disabled');
          });
      });

    // wysiwyg field rendering
    cy.get(`label[for="ks-input-wysiwygValue"]`)
      .should('exist')
      .then($label => {
        cy.get($label)
          .next()
          .within(() => {
            cy.get('iframe').then($iframe => {
              const iframe = $iframe.contents();
              cy.wrap(iframe.find('#tinymce')).should('have.attr', 'contenteditable', 'false');
            });
          });
      });
  });
});
