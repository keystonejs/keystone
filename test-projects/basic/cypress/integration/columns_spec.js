describe('Columns', () => {
  before(() => cy.visit('/reset-db'));

  [
    {
      url: '/admin/users',
      enable: ['Password', 'Company', 'Attachment'],
      disable: ['Name', 'Email'],
    },
    {
      url: '/admin/posts',
      enable: ['Views', 'Author', 'Categories'],
      disable: ['Name', 'Status'],
    },
    {
      url: '/admin/post-categories',
      enable: [],
      disable: ['Name'], // can't do all filters here as there needs to be at least one filter enabled
    },
  ].forEach(({ url, enable, disable }) => {
    it(`Testing all columns in ${url}`, () => {
      cy.visit(url);

      const openColumnControlsIfClosed = () =>
        new Promise(resolve => {
          cy.get('body')
            .find('#ks-column-select')
            .its('length')
            .then(l => {
              if (!l) {
                cy.get('#ks-column-button')
                  .click({ force: true })
                  .then(() => resolve());
              } else resolve();
            });
        });

      enable.forEach(name => {
        openColumnControlsIfClosed().then(() => {
          cy.get('#ks-column-select')
            .find('input[id^="react-select-"]')
            .clear({ force: true })
            .type(`${name}{enter}`, { force: true });

          cy.get('#ks-list-table').should('contain', name);
        });
      });

      disable.forEach(name => {
        openColumnControlsIfClosed().then(() => {
          cy.get('#ks-column-select')
            .find('input[id^="react-select-"]')
            .clear({ force: true })
            .type(`${name}{enter}`, { force: true });

          cy.get('#ks-list-table').should('not.contain', name);
        });
      });
    });
  });
});
