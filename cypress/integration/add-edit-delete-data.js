describe('Adding data', () => {
  [
    {
      url: 'http://localhost:3000/admin/users',
      data: {
        'ks-input-name': 'John Doe',
        'ks-input-email': 'john@gmail.com',
        'ks-input-password': 'password1',
        'ks-input-twitterId': '@johndoe',
        'ks-input-twitterUsername': 'John Doe',
      },
    },
    {
      url: 'http://localhost:3000/admin/posts',
      data: {
        'ks-input-name': 'My post',
        'ks-input-slug': 'mypost',
      },
    },
    {
      url: 'http://localhost:3000/admin/post-categories',
      data: {
        'ks-input-name': 'My category',
        'ks-input-slug': 'mycategory',
      },
    },
  ].forEach(({ url, data }) => {
    it(`Adding data to ${url}`, () => {
      cy.visit(url);
      cy.get('button[appearance="create"]').click();

      Object.keys(data).forEach(item => {
        cy.get(`#${item}`).type(data[item]);
      });

      cy.get('div[class*="Dialog"] button[appearance="create"]').click();

      Object.keys(data).forEach(item => {
        cy.get(`#${item}`).should('have.value', data[item]);
      });
    });
  });
});

describe('Editing data', () => {
  [
    {
      section: 'Users',
      url: 'http://localhost:3000/admin/users',
      field: {
        id: '#ks-input-name',
        value: 'John Doe',
        newValue: 'Jonny Dox',
      },
    },
    {
      section: 'Posts',
      url: 'http://localhost:3000/admin/posts',
      field: {
        id: '#ks-input-name',
        value: 'My post',
        newValue: 'Our post',
      },
    },
    {
      section: 'Post Categories',
      url: 'http://localhost:3000/admin/post-categories',
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
      cy
        .get(field.id)
        .clear()
        .type(field.newValue);
      cy.get('button[type="submit"][appearance="primary"]').click();
      cy.get(`nav a:contains("${section}")`).click();
      cy.get('body').should('contain', field.newValue);
    });
  });
});

describe('Deleting data', () => {
  [
    {
      section: 'Users',
      url: 'http://localhost:3000/admin/users',
      item: 'Jonny Dox',
    },
    {
      section: 'Posts',
      url: 'http://localhost:3000/admin/posts',
      item: 'Our post',
    },
    {
      section: 'Post Categories',
      url: 'http://localhost:3000/admin/post-categories',
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
