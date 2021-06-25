// describe('all pages', () => {
//   beforeEach(() => {
//     cy.visit('http://localhost:8000/docs');
//   });
//   it('should have basic markup', () => {
//     return cy.get('nav a').each(navItem => {
//       cy.visit(navItem[0].href).get('nav');
//       cy.get('header');
//       cy.get('main');
//     });
//   });
//   it('should not have any empty links', () => {
//     return cy.get('nav a').each(navItem => {
//       cy.visit(navItem[0].href);
//       cy.document().then(document => {
//         const item = document.querySelector('main a');
//         if (item) {
//           cy.get('main a').then(anchors => {
//             for (let anchor of anchors) {
//               expect(anchor.href).to.not.equal(undefined);
//             }
//           });
//         }
//       });
//     });
//   });
// });
