const USERNAME = 'boris@keystonejs.com';
const PASSWORD = 'correctbattery';

describe('Testing Login', () => {
  it('Shows login screen instead of admin page', () => {
    cy.visit('/admin');
    cy.get('[name="username"]').should('exist');
    cy.get('[name="password"]').should('exist');
    cy
      .get('button[type="submit"]')
      .should('exist')
      .should('contain', 'Sign In');
  });

  it('Shows login screen instead of users page', () => {
    cy.visit('/admin/users');
    cy.get('body').should('not.contain', 'Users');
    cy.get('[name="username"]').should('exist');
    cy.get('[name="password"]').should('exist');
    cy
      .get('button[type="submit"]')
      .should('exist')
      .should('contain', 'Sign In');
  });

  describe('Login failure', () => {
    it('Does not log in with empty credentials', () => {
      cy.visit('/admin');
      // There's a race condition where the click handler for the button doesn't
      // appear to be attached, so the form is not getting validated correctly
      cy.wait(250);
      cy.get('button[type="submit"]').click();
      cy
        .get('body')
        .should('contain', 'Your username and password were incorrect');
    });

    it('Does not log in with invalid credentials', () => {
      cy.visit('/admin');

      cy
        .get('input[name="username"]')
        .clear({ force: true })
        .type('fake@example.com', { force: true });

      cy
        .get('[name="password"]')
        .clear({ force: true })
        .type('gibberish', { force: true });

      cy.get('button[type="submit"]').click();
      cy
        .get('body')
        .should('contain', 'Your username and password were incorrect');
    });

    it('Does not log in with invalid username', () => {
      cy.visit('/admin');

      cy
        .get('input[name="username"]')
        .clear({ force: true })
        .type('fake@example.com', { force: true });

      cy
        .get('[name="password"]')
        .clear({ force: true })
        .type(PASSWORD, { force: true });

      cy.get('button[type="submit"]').click();
      cy
        .get('body')
        .should('contain', 'Your username and password were incorrect');
    });

    it('Does not log in with invalid password', () => {
      cy.visit('/admin');

      cy
        .get('input[name="username"]')
        .clear({ force: true })
        .type(USERNAME, { force: true });

      cy
        .get('[name="password"]')
        .clear({ force: true })
        .type('gibberish', { force: true });

      cy.get('button[type="submit"]').click();
      cy
        .get('body')
        .should('contain', 'Your username and password were incorrect');
    });
  });

  describe('Login success', () => {
    afterEach(() => {
      // Cypress claims to clear cookies before each test, but it appears that
      // the first test in the next describe block will continue to retain
      // cookies from the `preserveOnce` call above. So we manually clear them
      // now to avoid that.
      // See: https://github.com/cypress-io/cypress/issues/781
      cy.visit('/admin/signout');
      cy.clearCookies();
    });

    it('Logs in with valid credentials', () => {
      cy.visit('/admin');

      cy
        .get('input[name="username"]')
        .clear({ force: true })
        .type(USERNAME, { force: true });

      cy
        .get('[name="password"]')
        .clear({ force: true })
        .type(PASSWORD, { force: true });

      cy.get('button[type="submit"]').click();

      cy.get('body').should('contain', 'Users');
      cy.get('body').should('contain', 'Home');
    });

    it('Redirects to requested page after login', () => {
      cy.visit('/admin/users');

      cy
        .get('input[name="username"]')
        .clear({ force: true })
        .type(USERNAME, { force: true });

      cy
        .get('[name="password"]')
        .clear({ force: true })
        .type(PASSWORD, { force: true });

      cy.get('button[type="submit"]').click();

      cy.url().should('match', /admin\/users$/);
      cy.get('body').should('contain', 'Users');
      cy.get('body').should('contain', 'Showing 2 Users');
    });
  });
});
