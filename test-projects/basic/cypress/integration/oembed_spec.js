const path = '/admin/users?fields=_label_%2Cprofile';
const cuid = require('cuid');

const oembedInputSelector = `#ks-oembed-profile`;
const oembedPreviewSelector = `#ks-oembed-preview-profile`;

const getCellFromSecondRow = index =>
  `#ks-list-table tbody > tr:nth-child(2) > td:nth-child(${index})`;

const saveValue = value => {
  cy.get(oembedInputSelector).clear();
  if (value) {
    cy.get(oembedInputSelector).type(value, { force: true });
  }
  const alias = cuid.slug();
  // Setup to track XHR requests
  cy.server();
  // Alias the graphql request route
  cy.route('post', '**/admin/api').as(alias);
  // Avoid accidentally mocking routes
  cy.server({ enable: false });
  cy.get('#item-page-save-button').click({ force: true });
  return cy.wait(`@${alias}`);
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
      cy.get(oembedInputSelector).type('http://example.com', { force: true });
      cy.get(oembedPreviewSelector)
        .should('exist')
        .should('contain', 'Preview will be generated after save')
        .should('contain', 'http://example.com');
    });

    it('should not send empty string when saving', () => {
      cy.get(oembedInputSelector).should('have.value', '');
      // The input is empty now, so just click save again
      saveValue().then(({ request }) => {
        // Now we assert on what was sent to the server. It shouldn't have
        // included the oembed field at all (since nothing changed and the value
        // is empty string)
        expect(request.body.variables.data).to.be.an('object');
        expect(request.body.variables.data).to.not.haveOwnProperty('profile');
      });
    });

    it('should send string when saving', () => {
      cy.get(oembedInputSelector).should('have.value', '');
      const url = 'http://example.com?ck03eiuef0000tkpf8auu9j9z';
      saveValue(url).then(({ request }) => {
        // Now we assert on what was sent to the server. It should have
        // included the oembed field with the correct value
        expect(request.body.variables.data).to.be.an('object');
        expect(request.body.variables.data).to.haveOwnProperty('profile');
        expect(request.body.variables.data.profile).to.equal(url);
      });
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
      cy.get(oembedInputSelector).type('http://example.com', { force: true });
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
