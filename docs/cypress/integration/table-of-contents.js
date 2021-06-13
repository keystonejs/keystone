const { COLORS } = require('../../lib/TOKENS.ts');

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
    : null;
}

describe('table of contents', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000/docs/apis/config#0');
  });
  it('should scroll the selected heading to view', () => {
    cy.isNotInViewport('#extend-graphql-schema');
    cy.contains('a', 'extendGraphqlSchema').click();
    cy.isInViewport('#extend-graphql-schema');
  });
  it('should highlight the closest heading', () => {
    cy.contains('a', 'extendGraphqlSchema').click();
    cy.get('#extend-graphql-schema').scrollIntoView();
    cy.contains('a', 'extendGraphqlSchema').should(
      'have.css',
      'color',
      hexToRgb(COLORS['--link-active'])
    );
  });
});
