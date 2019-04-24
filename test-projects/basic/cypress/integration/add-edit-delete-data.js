describe('Adding data', () => {
  [
    {
      url: '/admin/users',
      data: {
        'ks-input-name': 'John Doe',
        'ks-input-email': 'john@gmail.com',
      },
    },
    {
      url: '/admin/posts',
      data: {
        'ks-input-name': 'My post',
        'ks-input-slug': 'mypost',
      },
    },
    {
      url: '/admin/post-categories',
      data: {
        'ks-input-name': 'My category',
        'ks-input-slug': 'mycategory',
      },
    },
  ].forEach(({ url, data }) => {
    it(`Adding data to ${url}`, () => {
      cy.visit(url);
      cy.get('#list-page-create-button').click();

      Object.keys(data).forEach(item => {
        cy.get(`#${item}`).type(data[item]);
      });

      cy.get('#create-item-modal-submit-button').click();

      cy.location('pathname').should('match', new RegExp(`${url}/.+`));

      Object.keys(data).forEach(item => {
        cy.get(`#${item}`).should('have.value', data[item]);
      });
    });
  });

  it(`Adds relationship items`, () => {
    const url = '/admin/posts';
    cy.visit(url);

    cy.server();
    cy.route('/admin/posts/*').as('newPost');

    cy.get('#list-page-create-button').click();

    cy.get('#ks-input-name').type('My post');
    cy.get('#ks-input-slug').type('mypost');
    cy.get('#ks-input-author').click({ force: true });
    cy.get('#ks-input-author').type('John Doe{downarrow}{enter}', {
      force: true,
    });

    cy.get('#create-item-modal-submit-button').click();

    cy.location('pathname').should('match', new RegExp(`${url}/.+`));

    cy.get('#ks-input-name').should('have.value', 'My post');
    cy.get('#ks-input-slug').should('have.value', 'mypost');
    cy.get('#react-select-ks-input-author').should('contain', 'John Doe');
  });
});

describe('Editing data', () => {
  [
    {
      section: 'Users',
      url: '/admin/users',
      field: {
        id: '#ks-input-name',
        value: 'John Doe',
        newValue: 'Jonny Dox',
      },
    },
    {
      section: 'Posts',
      url: '/admin/posts',
      field: {
        id: '#ks-input-name',
        value: 'My post',
        newValue: 'Our post',
      },
    },
    {
      section: 'Post Categories',
      url: '/admin/post-categories',
      field: {
        id: '#ks-input-name',
        value: 'My category',
        newValue: 'Our category',
      },
    },
  ].forEach(({ section, url, field }) => {
    it(`Editing data in ${section}`, () => {
      cy.visit(url);

      cy.get(`a:contains("${field.value}"):first`).click();
      cy.get(field.id)
        .clear()
        .type(field.newValue);
      cy.get('#item-page-save-button').click();
      cy.get(`nav a:contains("${section}")`).click();
      cy.get('body').should('contain', field.newValue);
    });
  });

  // FIXME: this test is very flakey so we're skipping it for now
  it.skip(`Updates relationship items`, () => {
    const url = '/admin/posts';
    cy.visit(url);

    cy.server();
    cy.route('/admin/posts/*').as('newPost');

    cy.get(`a:contains("My post"):first`).click();

    cy.location('pathname').then(path => {
      cy.get('#ks-input-author').click({ force: true });

      // Clear any value that might be there
      cy.get('#ks-input-author').type('{backspace}{esc}', { force: true });

      // save
      cy.get('#item-page-save-button').click();

      // Then reload the page
      cy.visit(path);

      // Assert that the field is empty
      cy.get('#react-select-ks-input-author').should('contain', 'Select...');

      // Select the first item
      cy.get('#ks-input-author').click({ force: true });
      cy.get('#ks-input-author').type('{downarrow}{enter}', { force: true });
      cy.get('#react-select-ks-input-author').then(([authorInput]) => {
        const userText = authorInput.textContent.replace(/.*option (.*), selected.*/, '$1');

        // save
        cy.get('#item-page-save-button').click();

        // Then reload the page
        cy.visit(path);

        cy.get('#react-select-ks-input-author').should('contain', userText);
      });
    });
  });
});

describe('Deleting data', () => {
  [
    {
      section: 'Users',
      url: '/admin/users',
      item: 'Jonny Dox',
    },
    {
      section: 'Posts',
      url: '/admin/posts',
      item: 'Our post',
    },
    {
      section: 'Post Categories',
      url: '/admin/post-categories',
      item: 'Our category',
    },
  ].forEach(({ section, url, item }) => {
    it(`Deleting data to ${section}`, () => {
      cy.visit(url);

      cy.get(`a:contains("${item}"):first`).click();
      cy.get('button:contains("Delete"):first').click();
      cy.get('body:last footer button:first').click();
      cy.get('body').should('not.contain', item);
    });
  });
});
