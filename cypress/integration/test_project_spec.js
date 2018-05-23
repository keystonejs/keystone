describe('Test Project Smoke Tests', () => {
  it('Should be able to access welcome message /', () => {
    cy.visit('http://localhost:3000/');

    cy.get('body').should('contain', 'Welcome');
  });

  it('Should be able to click through to admin page.', () => {
    cy.visit('http://localhost:3000/');

    cy.contains('Open').click();

    cy.url().should('include', '/admin');
  });
});

describe('Nav Bar', () => {
  // Testing links which should open in a new tab is a bit tricky in Cypress.
  // The discussion at this page lists some of the details.
  // https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/testing-dom__tab-handling-links/cypress/integration/tab_handling_anchor_links_spec.js
  [
    { text: 'Dashboard', target: '/admin' },
    { text: 'Users', target: '/admin/users' },
    { text: 'Posts', target: '/admin/posts' },
    { text: 'Post Categories', target: '/admin/post-categories' },
    {
      text: 'GitHub',
      target: 'https://github.com/keystonejs/keystone-5',
      newTab: true,
    },
    { text: 'Graphiql', target: '/admin/graphiql', newTab: true },
    { text: 'Style Guide', target: '/admin/style-guide' },
    { text: 'Sign Out', target: '/admin/signin' },
  ].forEach(({ text, target, newTab = false }) => {
    it(`${newTab ? 'Check' : 'Click'} ${text}`, () => {
      cy.visit('http://localhost:3000/admin');

      cy
        .get('nav')
        .contains(text)
        .should('have.attr', 'href', target);
      if (newTab) {
        cy
          .get('nav')
          .contains(text)
          .should('have.attr', 'target', '_blank');
      } else {
        cy
          .get('nav')
          .contains(text)
          .click();
        cy.url().should('include', target);
      }
    });
  });
});

describe('Home page', () => {
  [
    { text: 'Users', target: 'users' },
    { text: 'Posts', target: 'posts' },
    { text: 'Post Categories', target: 'post-categories' },
  ].forEach(({ text, target }) => {
    it(`Click through to list page - ${text}`, () => {
      cy.visit('http://localhost:3000/admin');
      cy
        .contains(`Show ${text}`)
        .should('have.attr', 'href', `/admin/${target}`)
        .should('have.attr', 'title', `Show ${text}`)
        .click();

      cy.url().should('include', target);
    });
  });

  it('Create list buttons exists', () => {
    cy.visit('http://localhost:3000/admin');

    [{ text: 'User' }, { text: 'Post' }, { text: 'Post Category' }].forEach(
      ({ text }) => {
        cy
          .contains('button', `Create ${text}`)
          .should('have.attr', 'title', `Create ${text}`);
      }
    );
  });

  it('Ensure Create Modal opens, has the correct fields, and Cancels', () => {
    cy.visit('http://localhost:3000/admin');

    [
      {
        text: 'User',
        labels: [
          'Name',
          'Email',
          'Password',
          'Twitterid',
          'Twitterusername',
          'Company',
        ],
      },
      {
        text: 'Post',
        labels: ['Name', 'Slug', 'Status', 'Author', 'Categories'],
      },
      { text: 'Post Category', labels: ['Name', 'Slug'] },
    ].forEach(({ text, labels }) => {
      cy.contains('button', `Create ${text}`).click();
      cy
        .contains('div', `Create ${text} Dialog`)
        .contains('h3', `Create ${text}`);
      cy.contains('div', `Create ${text} Dialog`).contains('button', 'Create');
      labels.forEach(label => {
        cy.contains('div[data-selector="field-container"]', label);
      });
      cy
        .contains('div', `Create ${text} Dialog`)
        .contains('button', 'Cancel')
        .click();
      cy.contains('div', `Create ${text} Dialog`).should('not.exist');
    });
  });
});
