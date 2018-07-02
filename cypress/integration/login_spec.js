const USERNAME = 'boris@keystonejs.com';
const PASSWORD = 'correctbattery';

describe('Testing Login', () => {
  it('Shows login screen instead of admin page', () => {
    cy
      .task('getProjectInfo', 'login')
      .then(({ env: { PORT } }) => cy.visit(`http://localhost:${PORT}/admin`));
    cy.get('[name="username"]').should('exist');
    cy.get('[name="password"]').should('exist');
    cy
      .get('button[type="submit"]')
      .should('exist')
      .should('contain', 'Sign In');
  });

  it('Shows login screen instead of users page', () => {
    cy
      .task('getProjectInfo', 'login')
      .then(({ env: { PORT } }) =>
        cy.visit(`http://localhost:${PORT}/admin/users`)
      );
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
      cy
        .task('getProjectInfo', 'login')
        .then(({ env: { PORT } }) =>
          cy.visit(`http://localhost:${PORT}/admin`)
        );
      cy.get('button[type="submit"]').click();
      cy
        .get('body')
        .should('not.contain', 'Home');
    });

    it('Does not log in with invalid credentials', () => {
      cy
        .task('getProjectInfo', 'login')
        .then(({ env: { PORT } }) =>
          cy.visit(`http://localhost:${PORT}/admin`)
        );

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
        .should('not.contain', 'Home');
    });

    it('Does not log in with invalid username', () => {
      cy
        .task('getProjectInfo', 'login')
        .then(({ env: { PORT } }) =>
          cy.visit(`http://localhost:${PORT}/admin`)
        );

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
        .should('not.contain', 'Home');
    });

    it('Does not log in with invalid password', () => {
      cy
        .task('getProjectInfo', 'login')
        .then(({ env: { PORT } }) =>
          cy.visit(`http://localhost:${PORT}/admin`)
        );

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
        .should('not.contain', 'Home');
    });
  });

  describe('Login success', () => {
    it('Logs in with valid credentials', () => {
      cy
        .task('getProjectInfo', 'login')
        .then(({ env: { PORT } }) =>
          cy.visit(`http://localhost:${PORT}/admin`)
        );

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
  });
});
