describe('Navigation', () => {
	before(() => {
		cy.visit(`http://localhost:8080/`);
	});

	it('Click first item', () => {
		cy.get('[data-test-nav]:first-child [data-test-nav-link]').click();
	});
});
