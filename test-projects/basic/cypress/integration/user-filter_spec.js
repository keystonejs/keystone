describe('Filter by name', () => {
  before(() => cy.visit('/reset-db'));

  it('Should filter by name', () => {
    cy.get('a[href="/admin/users"]:last')
      .click({ force: true })
      .get('button:contains("Filters")')
      .click({ force: true })
      .get('#app ~ div')
      .find('[id="react-select-2-option-1"]')
      .click({ force: true })
      .get('[placeholder="Name contains"]')
      .type(`John`)
      .get('button:contains("Apply")')
      .click({ force: true })
      .get('main')
      .should('contain', 'John');
  });
});

describe('Filter by email', () => {
  before(() => cy.visit('/reset-db'));
  it('Should filter by email', () => {
    cy.get('a[href="/admin/users"]:last')
      .click({ force: true })
      .get('button:contains("Filters")')
      .click({ force: true })
      .get('#app ~ div')
      .find('[id="react-select-2-option-2"]')
      .click({ force: true })
      .get('[placeholder="Email contains"]')
      .type(`ben`)
      .get('button:contains("Apply")')
      .click({ force: true })
      .get('main')
      .should('contain', 'ben');
  });
});

describe('Filter by company', () => {
  before(() => cy.visit('/reset-db'));
  it('Should filter by company', () => {
    cy.get('a[href="/admin/users"]:last')
      .click({ force: true })
      .get('button:contains("Filters")')
      .click({ force: true })
      .get('#app ~ div')
      .find('[id="react-select-2-option-2"]')
      .click({ force: true })
      .get('[placeholder="Email contains"]')
      .type(`Thinkmill`)
      .get('button:contains("Apply")')
      .click({ force: true })
      .get('main')
      .should('contain', 'thinkmill');
  });
});
