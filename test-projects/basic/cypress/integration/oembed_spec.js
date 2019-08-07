const path = '/admin/users?fields=_label_%2Cprofile';

const oembedInputSelector = `#ks-oembed-profile`;
const oembedPreviewSelector = `#ks-oembed-preview-profile`;

const getCellFromSecondRow = index =>
  `#ks-list-table tbody > tr:nth-child(2) > td:nth-child(${index})`;

const saveValue = value => {
  cy.get(oembedInputSelector).clear();
  if (value) {
    cy.get(oembedInputSelector).type(value);
  }
  // Setup to track XHR requests
  cy.server();
  // Alias the graphql request route
  cy.route('post', '**/admin/api').as('graphqlPost');
  // Avoid accidentally mocking routes
  cy.server({ enable: false });
  cy.get('#item-page-save-button').click({ force: true });
  cy.wait('@graphqlPost');
};

describe('OEmbed <Field> view', () => {
  describe('no saved value', () => {
    before(() => {
      cy.visit(path);
      cy.get(`#ks-list-table tbody > tr:nth-child(1) > td:nth-child(2) > a`).click({ force: true });
      saveValue();
    });

    beforeEach(() => {
      cy.reload(true);
    });

    it('does not display any preview on page load', () => {
      cy.get(oembedInputSelector).should('have.value', '');
      cy.get(oembedPreviewSelector).should('not.exist');
    });

    it('displays a placeholder preview when adding a value', () => {
      cy.get(oembedInputSelector).should('have.value', '');
      cy.get(oembedInputSelector).type('http://example.com');
      cy.get(oembedPreviewSelector)
        .should('exist')
        .should('contain', 'Preview will be generated after save')
        .should('contain', 'http://example.com');
    });
  });

  describe('existing saved value', () => {
    before(() => {
      cy.visit(path);
      cy.get(`#ks-list-table tbody > tr:nth-child(1) > td:nth-child(2) > a`).click({ force: true });
      saveValue('http://example.com?cjwsyh30x0000xzn59j0xhq38');
    });

    beforeEach(() => {
      cy.reload(true);
    });

    it('displays a preview on page load', () => {
      cy.get(oembedInputSelector).should('not.have.value', '');
      cy.get(oembedPreviewSelector)
        .should('exist')
        .should('contain', 'This is Mock Embed Data cjwsmecy400002epf7zhgb063')
        .should('contain', 'http://example.com?cjwsyh30x0000xzn59j0xhq38');
    });

    it('does not display any preview when empty when editing to remove', () => {
      cy.get(oembedInputSelector).should('not.have.value', '');
      cy.get(oembedInputSelector).clear();
      cy.get(oembedPreviewSelector).should('not.exist');
    });

    it('displays a placeholder preview when editing a value', () => {
      cy.get(oembedInputSelector).should('not.have.value', '');
      cy.get(oembedInputSelector).clear();
      cy.get(oembedInputSelector).type('http://example.com');
      cy.get(oembedPreviewSelector)
        .should('exist')
        .should('contain', 'Preview will be generated after save')
        .should('contain', 'http://example.com');
    });
  });
});

describe('OEmbed <Cell> view', () => {
  describe('no saved value', () => {
    before(() => {
      cy.visit(path);
      cy.get(`#ks-list-table tbody > tr:nth-child(1) > td:nth-child(2) > a`).click({ force: true });
      saveValue();
    });

    beforeEach(() => {
      cy.visit(path);
    });

    it('does not display any preview', () => {
      cy.get(oembedPreviewSelector).should('not.exist');
    });
  });

  describe('existing saved value', () => {
    before(() => {
      cy.visit(path);
      cy.get(`#ks-list-table tbody > tr:nth-child(1) > td:nth-child(2) > a`).click({ force: true });
      saveValue('http://example.com?cjwsyh30x0000xzn59j0xhq38');
    });

    beforeEach(() => {
      cy.visit(path);
    });

    it('displays a preview', () => {
      cy.get(oembedPreviewSelector)
        .should('exist')
        .should('contain', 'This is Mock Embed Data cjwsmecy400002epf7zhgb063')
        .should('contain', 'http://example.com?cjwsyh30x0000xzn59j0xhq38');
    });
  });
});
