describe('Search', () => {
  before(() => cy.visit('/reset-db'));

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
      notFound: ['Hello Things'],
    },
    {
      url: '/admin/post-categories',
      searchTerm: 'key',
      found: ['Keystone'],
      notFound: ['GraphQL', 'Node', 'React'],
    },
  ].forEach(({ url, searchTerm, found, notFound }) => {
    it(`Searching for "${searchTerm}" in ${url}`, () => {
      cy.visit(url);

      // First ensure we can see the values
      [...notFound, ...found].forEach(name => {
        cy.get('main').should('contain', name);
      });

      // Setup to track XHR requests
      cy.server();
      // Alias the graphql request route
      cy.route('post', '**/admin/api').as('graphqlPost');
      // Avoid accidentally mocking routes
      cy.server({ enable: false });

      cy.wait(500); // Search is now suspenseful need to wait
      cy.get('#ks-list-search-input').type(searchTerm, { force: true });

      cy.wait('@graphqlPost');

      // Then ensure we can still see some of the values
      found.forEach(name => {
        cy.get('main').should('contain', name);
      });

      // And ensure we can't see the filtered values
      notFound.forEach(name => {
        cy.get('main').should('not.contain', name);
      });
    });
  });
});
