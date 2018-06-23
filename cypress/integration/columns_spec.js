describe('Columns', () => {
  before(() => {
    cy.visit('http://localhost:3000/reset-db');
  });

  [
    {
      url: 'http://localhost:3000/admin/users',
      enable: [
        'Password',
        'Company',
        'Attachment',
      ],
      disable: ['Name', 'Email'],
    },
    {
      url: 'http://localhost:3000/admin/posts',
      enable: ['Status', 'Author', 'Categories'],
      disable: ['Name', 'Slug'],
    },
    {
      url: 'http://localhost:3000/admin/post-categories',
      enable: [],
      disable: ['Name'], // can't do all filters here as there needs to be at least one filter enabled
    },
  ].forEach(({ url, enable, disable }) => {
    it(`Testing all columns in ${url}`, () => {
      cy.visit(url);
      cy.get('button:contains("Columns")').click();

      enable.forEach(name => {
        cy
          .get('#app ~ div')
          .find('input[id^="react-select-"]')
          .clear({ force: true })
          .type(`${name}{enter}`, { force: true });
        cy.get('main').should('contain', name);
      });

      disable.forEach(name => {
        cy
          .get('#app ~ div')
          .find('input[id^="react-select-"]')
          .clear({ force: true })
          .type(`${name}{enter}`, { force: true });
        cy.get('main').should('not.contain', name);
      });
    });
  });
});
