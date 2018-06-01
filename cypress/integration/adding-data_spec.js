describe('Adding data', () => {
  [
    {
      text: 'User',
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
      text: 'Post',
      url: 'http://localhost:3000/admin/posts',
      data: {
        'ks-input-name': 'My post',
        'ks-input-slug': 'mypost',
      },
    },
    {
      text: 'Post Category',
      url: 'http://localhost:3000/admin/post-categories',
      data: {
        'ks-input-name': 'My category',
        'ks-input-slug': 'mycategory',
      },
    },
  ].forEach(({ text, url, data }) => {
    it(`Adding data to ${text}`, () => {
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
