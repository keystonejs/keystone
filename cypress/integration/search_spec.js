describe('Search', () => {
  before(() => (
    cy.task('getProjectInfo', 'basic').then(({ env: { PORT } }) => (
      cy.visit(`http://localhost:${PORT}/reset-db`)
    ))
  ));

  [
    {
      url: '/admin/users',
      searchTerm: 'j',
      found: ['Jed Watson', 'John Molomby', 'Joss Mackison', 'Jared Crowe'],
      notFound: ['Boris Bozic', 'Ben Conolly', 'Luke Batchelor', 'Tom Walker'],
    },
    {
      url: '/admin/posts',
      searchTerm: 'hello planet',
      found: [],
      notFound: ['Hello World'],
    },
    {
      url: '/admin/post-categories',
      searchTerm: 'key',
      found: ['Keystone'],
      notFound: ['GraphQL', 'Node', 'React'],
    },
  ].forEach(({ url, searchTerm, found, notFound }) => {
    it(`Searching for "${searchTerm}" in ${url}`, () => {
      cy.task('getProjectInfo', 'basic').then(({ env: { PORT } }) => (
        cy.visit(`http://localhost:${PORT}${url}`)
      ));
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
