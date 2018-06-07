describe('Search', () => {
  before(() => {
    cy.visit('http://localhost:3000/reset-db');
  });

  [
    {
      url: 'http://localhost:3000/admin/users',
      searchTerm: 'j',
      found: ['Jed Watson', 'John Molomby', 'Joss Mackison', 'Jared Crowe'],
      notFound: ['Boris Bozic', 'Ben Conolly', 'Luke Batchelor', 'Tom Walker'],
    },
    {
      url: 'http://localhost:3000/admin/posts',
      searchTerm: 'hello planet',
      found: [],
      notFound: ['Hello World'],
    },
    {
      url: 'http://localhost:3000/admin/post-categories',
      searchTerm: 'key',
      found: ['Keystone'],
      notFound: ['GraphQL', 'Node', 'React'],
    },
  ].forEach(({ url, searchTerm, found, notFound }) => {
    it(`Searching for "${searchTerm}" in ${url}`, () => {
      cy.visit(url);
      cy.get('#list-search-input').type(searchTerm);

      found.forEach(name => {
        cy.get('main').should('contain', name);
      });

      notFound.forEach(name => {
        cy.get('main').should('not.contain', name);
      });
    });
  });
});
