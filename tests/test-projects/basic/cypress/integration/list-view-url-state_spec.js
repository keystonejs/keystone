describe('List view URL state', () => {
  before(() => cy.visit('/reset-db'));

  it('Stores currentPage state in the url', () => {
    // Loading at page 3
    cy.visit('/admin/posts?currentPage=3');

    cy.get('[aria-label="Go to page 3"]')
      .should('have.attr', 'aria-current', 'page')
      .should('contain', '3');

    // Navigate to page 2
    cy.get('[aria-label="Go to page 2"]').should('contain', '2').click({ force: true });
    cy.location('search').should('eq', '?currentPage=2');

    cy.wait(500);

    // Navigate to page 1 - this is the default so it should remove the search string
    cy.get('[aria-label="Go to page 1"]').should('contain', '1').click({ force: true });

    cy.location('search').should('eq', '');
  });
  it('Stores pageSize state in the url', () => {
    cy.visit('/admin/posts');

    // NOTE: Posts in the basic project has defaultPageSize set to 20.
    cy.get('#ks-pagination-count').should('contain', 'Showing 1 to 20 of');
    cy.get('#ks-list-table tbody tr').should('have.lengthOf', 20);

    cy.visit('/admin/posts?pageSize=75');
    cy.get('#ks-pagination-count').should('contain', 'Showing 1 to 75 of');
    cy.get('#ks-list-table tbody tr').should('have.lengthOf', 75);

    // click on a page button - to make sure we do not loose the page size
    cy.get('[aria-label="Go to page 2"]').click({ force: true });
    cy.location('search').should('contain', 'currentPage=2').should('contain', 'pageSize=75');
  });
  it('Stores search state in the url', () => {
    cy.visit('/admin/posts');

    // Setup to track XHR requests
    cy.server();
    // Alias the graphql request route
    cy.route('post', '**/admin/api').as('graphqlPost');
    // Avoid accidentally mocking routes
    cy.server({ enable: false });

    cy.wait(500); // Search is now suspenseful need to wait
    cy.get('#ks-list-search-input').type('Why', { force: true });

    cy.wait('@graphqlPost');

    cy.location('search').should('eq', '?search=Why');

    // The results should be updated.
    cy.get('#ks-list-table tbody tr:first').should('contain', 'Why');

    cy.visit('/admin/posts?search=Hello');
    cy.get('#ks-list-search-input').should('have.attr', 'value', 'Hello');
  });
  it('Stores field settings in the url', () => {
    // Without `fields` we should see the default
    // defaultColumns: 'name, status',
    cy.visit('/admin/posts');
    cy.get('#ks-list-table thead th')
      .should('have.lengthOf', 5)
      .should('contain', 'Label')
      .should('contain', 'Name')
      .should('contain', 'Status');

    // UI should update the URL
    cy.get('#ks-column-button').click({ force: true });
    cy.get('#app ~ div')
      .find('input[id^="react-select-"]')
      .clear({ force: true })
      .type(`author{enter}`, { force: true });
    cy.get('#ks-list-table thead th')
      .should('have.lengthOf', 6)
      .should('contain', 'Name')
      .should('contain', 'Status')
      .should('contain', 'Author');
    cy.location('search').should('eq', '?fields=_label_%2Cname%2Cstatus%2Cauthor');

    // URL should define the columns
    cy.visit('/admin/posts?fields=name,author,categories');
    cy.get('#ks-list-table thead th')
      .should('have.lengthOf', 5)
      .should('contain', 'Name')
      .should('contain', 'Author')
      .should('contain', 'Categories');
  });
  it('Stores sortBy state in the url', () => {
    cy.visit('/admin/posts');
    cy.get('#list-page-sort-button').should('contain', 'Name');

    cy.visit('/admin/posts?sortBy=status');
    cy.get('#list-page-sort-button').should('contain', 'Status');

    // Sort DESC
    cy.visit('/admin/posts?sortBy=-name');
    cy.get('#list-page-sort-button').should('contain', 'Name');

    // UI should update url
    cy.get('#list-page-sort-button').click({ force: true });
    cy.get('#app ~ div')
      .find('input[id^="react-select-"]')
      .clear({ force: true })
      .type(`categories{enter}`, { force: true });
    cy.location('search').should('eq', '?sortBy=categories');
  });
  it('Stores filter state in the url', () => {
    // Filter defined in the url
    cy.visit('/admin/posts?!name_contains_i="Hello"');
    cy.get('#ks-list-active-filters button:nth-of-type(1)').should(
      'contain',
      'Name contains: "Hello"'
    );

    // Clear the filter
    cy.get('#ks-list-active-filters button:nth-of-type(2)').click({ force: true });
    cy.location('search').should('eq', '');

    // Set a filter
    cy.visit('/admin/posts');
    cy.get('button:contains("Filters")').click({ force: true });
    cy.get('#app ~ div')
      .find('input[id^="react-select-"]')
      .clear({ force: true })
      .type(`name{enter}`, { force: true });
    cy.get('#app ~ div')
      .find('input[placeholder="Name contains"]')
      .clear()
      .type(`keystone{enter}`, { force: true });
    cy.location('search').should('eq', '?!name_contains_i=%22keystone%22');
    cy.get('#ks-list-active-filters button:nth-of-type(1)').should(
      'contain',
      'Name contains: "keystone"'
    );
  });

  // - combination
  it('Combines state in the url', () => {
    // Testing config from search string
    // ---------------------------------
    const params = [
      'currentPage=2',
      'pageSize=10',
      'search=Why',
      'fields=name,views',
      'sortBy=-views',
      '!views_gt="10"',
    ];
    cy.visit(`/admin/posts?${params.join('&')}`);

    cy.get('[aria-label="Go to page 2"]').should('have.attr', 'aria-current', 'page');
    // Has the correct number of items per page (pageSize)
    cy.get('#ks-pagination-count').should('contain', 'Showing 11 to 20 of');
    // Search
    cy.get('#ks-list-search-input').should('have.attr', 'value', 'Why');
    // Has the correct columns (fields)
    cy.get('#ks-list-table thead th')
      .should('have.lengthOf', 4)
      .should('contain', 'Name')
      .should('contain', 'Views');
    // Is sorted by sortby
    cy.get('#list-page-sort-button').should('contain', 'Views');
    // Has the filter
    cy.get('#ks-list-active-filters button:nth-of-type(1)').should(
      'contain',
      'Views is greater than: "10"'
    );

    // Testing re-creating the search string from config
    // ---------------------------------

    // Go to page 1
    cy.get('[aria-label="Go to page 1"]').click({ force: true });

    cy.location('search')
      .should('not.contain', 'currentPage')
      .should('contain', 'pageSize=10')
      .should('contain', 'search=Why')
      .should('contain', 'fields=name%2Cviews')
      .should('contain', 'sortBy=-views')
      .should('contain', '!views_gt=%2210%22');
  });
});
