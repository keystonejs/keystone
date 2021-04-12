describe.skip('on click of a link icon', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000/guides/cli', {
      onBeforeLoad(win) {
        cy.spy(win.navigator.clipboard, 'writeText').as('copy');
      },
    });
  });
  it('populates the navigator clipboard with the appropriate link', () => {
    cy.get('#run a').click();
    return cy
      .window()
      .then(win => {
        return win.navigator.clipboard.readText();
      })
      .then(text => expect(text).to.equal('http://localhost:8000/guides/cli#run'));
  });
  it('changes the URL to the specified anchor href', () => {
    cy.get('#keystone-next-dev-default a').click();
    return cy.window().then(win => {
      expect(win.location.href).to.equal(
        'http://localhost:8000/guides/cli#keystone-next-dev-default'
      );
    });
  });
});
