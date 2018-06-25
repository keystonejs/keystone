describe('Columns', () => {
  before(() => (
    cy.task('getProjectInfo', 'basic').then(({ env: { PORT } }) => (
      cy.visit(`http://localhost:${PORT}/reset-db`)
    ))
  ));

  [
    {
      url: '/admin/users',
      enable: ['Password', 'Company', 'Attachment'],
      disable: ['Name', 'Email'],
    },
    {
      url: '/admin/posts',
      enable: ['Status', 'Author', 'Categories'],
      disable: ['Name', 'Slug'],
    },
    {
      url: '/admin/post-categories',
      enable: [],
      disable: ['Name'], // can't do all filters here as there needs to be at least one filter enabled
    },
  ].forEach(({ url, enable, disable }) => {
    it(`Testing all columns in ${url}`, () => {
      cy.task('getProjectInfo', 'basic').then(({ env: { PORT } }) => (
        cy.visit(`http://localhost:${PORT}${url}`)
      ));
      cy.get('button:contains("Columns")').click();

      enable.forEach(name => {
        cy
          .get('#app ~ div')
          .find('input[id^="react-select-"]')
          .clear()
          .type(`${name}{enter}`);
        cy.get('main').should('contain', name);
      });

      disable.forEach(name => {
        cy
          .get('#app ~ div')
          .find('input[id^="react-select-"]')
          .clear()
          .type(`${name}{enter}`);
        cy.get('main').should('not.contain', name);
      });
    });
  });
});
