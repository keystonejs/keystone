// const SIGNUP_ENDPOINT = 'https://signup.keystonejs.cloud/api/newsletter-signup';
// describe('on successful submit', () => {
//   beforeEach(() => {
//     cy.visit('http://localhost:8000/docs');
//     cy.server();
//     cy.route('POST', SIGNUP_ENDPOINT, {
//       success: true,
//       email: 'cc.lee@live.com.au',
//     }).as('newsletterSignup');
//     cy.get('input[type=text]').type('cc.lee@live.com.au');
//     cy.get('form button').click();
//   });
//   it('should replace the form with a thank you message', () => {
//     return cy.wait('@newsletterSignup').then(() => {
//       cy.contains('❤️ Thank you for subscribing!');
//     });
//   });
//   it('should post the email to the expected URL', () => {
//     return cy.wait('@newsletterSignup').then(({ request }) => {
//       expect(request.body.email).to.equal('cc.lee@live.com.au');
//       expect(request.body.source).to.equal('@keystone-next/website');
//     });
//   });
// });

// describe('on unsuccessful server side validation', () => {
//   beforeEach(() => {
//     cy.visit('http://localhost:8000/docs');
//     cy.server();
//     cy.route({
//       method: 'POST',
//       url: SIGNUP_ENDPOINT,
//       status: 400,
//       response: {
//         error: 'Invalid email address',
//       },
//     }).as('newsletterSignup');
//     cy.get('input[type=text]').type('cc.lee@live.com.au');
//     cy.get('form button').click();
//   });
//   it('should prompt the user to try again', () => {
//     return cy.wait('@newsletterSignup').then(() => {
//       cy.get('form button').contains('Try again');
//     });
//   });
//   it('should display an appropriate error message', () => {
//     return cy.wait('@newsletterSignup').then(() => {
//       cy.contains('Invalid email address');
//     });
//   });
// });

// describe('on unsuccessful client side validation', () => {
//   beforeEach(() => {
//     cy.visit('http://localhost:8000/docs');
//     cy.get('input[type=text]').type('cc.le');
//     cy.get('form button').click();
//   });
//   it('should prompt the user to try again', () => {
//     cy.get('form button').contains('Try again');
//   });
//   it('shold display an appropriate error message', () => {
//     cy.contains('Please enter a valid email');
//   });
// });
