/* eslint-disable jest/valid-expect */
const memoize = require('fast-memoize');

function yesNo(truthy) {
  return truthy ? 'Yes' : 'No';
}

// memoize to avoid a circular dependency
const usersByLevel = memoize(() => {
  const { User: users } = require('../../data');
  return users.reduce((memo, user) => {
    memo[user.level] = memo[user.level] || [];
    memo[user.level].push(user);
    return memo;
  }, {});
});

module.exports = {
  getStaticListName(access) {
    return `${yesNo(access.create)}Create${yesNo(access.read)}Read${yesNo(
      access.update
    )}Update${yesNo(access.delete)}DeleteStaticList`;
  },

  getDynamicListName(access) {
    return `${yesNo(access.create)}Create${yesNo(access.read)}Read${yesNo(
      access.update
    )}Update${yesNo(access.delete)}DeleteDynamicList`;
  },

  getDynamicForAdminOnlyListName(access) {
    return `${yesNo(access.create)}Create${yesNo(access.read)}Read${yesNo(
      access.update
    )}Update${yesNo(access.delete)}DeleteDynamicForAdminOnlyList`;
  },

  // prettier-ignore
  accessCombinations: [
    { create: false, read: false, update: false, delete: false },
    { create: true,  read: false, update: false, delete: false },
    { create: false, read: true,  update: false, delete: false },
    { create: true,  read: true,  update: false, delete: false },
    { create: false, read: false, update: true,  delete: false },
    { create: true,  read: false, update: true,  delete: false },
    { create: false, read: true,  update: true,  delete: false },
    { create: true,  read: true,  update: true,  delete: false },
    { create: false, read: false, update: false, delete: true },
    { create: true,  read: false, update: false, delete: true },
    { create: false, read: true,  update: false, delete: true },
    { create: true,  read: true,  update: false, delete: true },
    { create: false, read: false, update: true,  delete: true },
    { create: true,  read: false, update: true,  delete: true },
    { create: false, read: true,  update: true,  delete: true },
    { create: true,  read: true,  update: true,  delete: true },
  ],

  stayLoggedIn(level) {
    before(() =>
      cy.loginToKeystone(
        usersByLevel()[level][0].email,
        usersByLevel()[level][0].password
      )
    );

    beforeEach(() =>
      // For each of the tests, ensure we stay logged in
      Cypress.Cookies.preserveOnce('keystone-admin.sid'));

    after(() => {
      // Cypress claims to clear cookies before each test, but it appears that
      // the first test in the next describe block will continue to retain
      // cookies from the `preserveOnce` call above. So we manually clear them
      // now to avoid that.
      // See: https://github.com/cypress-io/cypress/issues/781
      cy.visit('/admin/signout');
      cy.clearCookies();
    });
  },
};
