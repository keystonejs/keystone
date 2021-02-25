/// <reference types="cypress" />

describe('basic docs tests', () => {
  beforeEach(() => {
    console.log(process.env.SITE_URL);
    cy.visit('http://localhost:8000');
  });
  it('finds the Welcome content', () => {
    cy.contains('Welcome');
  });
});
