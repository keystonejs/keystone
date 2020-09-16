/* eslint-disable jest/valid-expect */
const memoize = require('micro-memoize');

function yesNo(truthy) {
  return truthy ? 'Yes' : 'No';
}

function getPrefix(access) {
  // prettier-ignore
  let prefix = `${yesNo(access.create)}Create${yesNo(access.read)}Read${yesNo(access.update)}Update${yesNo(access.auth)}Auth`;
  if (Object.prototype.hasOwnProperty.call(access, 'delete')) {
    prefix = `${prefix}${yesNo(access.delete)}Delete`;
  }
  return prefix;
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
    return `${getPrefix(access)}StaticList`;
  },

  getImperativeListName(access) {
    return `${getPrefix(access)}ImperativeList`;
  },

  getDeclarativeListName(access) {
    return `${getPrefix(access)}DeclarativeList`;
  },

  getFieldName(access) {
    return getPrefix(access);
  },

  listNameToCollectionName(name) {
    return `${name.toLowerCase()}s`;
  },

  /* Generated with:
  const result = [];
  const options = ['create', 'read', 'update', 'delete', 'auth'];
  // All possible combinations are contained in the set 0..2^n-1
  for(let flags = 0; flags < Math.pow(2, options.length); flags++) {
    // Generate an object of true/false values for the particular combination
    result.push(options.reduce((memo, option, index) => ({
      ...memo,
      // Use a bit mask to see if that bit is set
      [option]: !!(flags & (1 << index)),
    }), {}));
  }
  */
  // prettier-ignore
  listAccessVariations: [
    { create: false, read: false, update: false, delete: false, auth: true },
    { create: true,  read: false, update: false, delete: false, auth: true },
    { create: false, read: true,  update: false, delete: false, auth: true },
    { create: true,  read: true,  update: false, delete: false, auth: true },
    { create: false, read: false, update: true,  delete: false, auth: true },
    { create: true,  read: false, update: true,  delete: false, auth: true },
    { create: false, read: true,  update: true,  delete: false, auth: true },
    { create: true,  read: true,  update: true,  delete: false, auth: true },
    { create: false, read: false, update: false, delete: true, auth: true },
    { create: true,  read: false, update: false, delete: true, auth: true },
    { create: false, read: true,  update: false, delete: true, auth: true },
    { create: true,  read: true,  update: false, delete: true, auth: true },
    { create: false, read: false, update: true,  delete: true, auth: true },
    { create: true,  read: false, update: true,  delete: true, auth: true },
    { create: false, read: true,  update: true,  delete: true, auth: true },
    { create: true,  read: true,  update: true,  delete: true, auth: true },
    { create: false, read: false, update: false, delete: false, auth: false },
    { create: true,  read: false, update: false, delete: false, auth: false },
    { create: false, read: true,  update: false, delete: false, auth: false },
    { create: true,  read: true,  update: false, delete: false, auth: false },
    { create: false, read: false, update: true,  delete: false, auth: false },
    { create: true,  read: false, update: true,  delete: false, auth: false },
    { create: false, read: true,  update: true,  delete: false, auth: false },
    { create: true,  read: true,  update: true,  delete: false, auth: false },
    { create: false, read: false, update: false, delete: true, auth: false },
    { create: true,  read: false, update: false, delete: true, auth: false },
    { create: false, read: true,  update: false, delete: true, auth: false },
    { create: true,  read: true,  update: false, delete: true, auth: false },
    { create: false, read: false, update: true,  delete: true, auth: false },
    { create: true,  read: false, update: true,  delete: true, auth: false },
    { create: false, read: true,  update: true,  delete: true, auth: false },
    { create: true,  read: true,  update: true,  delete: true, auth: false },
  ],

  fieldAccessVariations: [
    { create: false, read: false, update: false },
    { create: true, read: false, update: false },
    { create: false, read: true, update: false },
    { create: true, read: true, update: false },
    { create: false, read: false, update: true },
    { create: true, read: false, update: true },
    { create: false, read: true, update: true },
    { create: true, read: true, update: true },
  ],

  stayLoggedIn(level) {
    before(() =>
      cy.loginToKeystone(usersByLevel()[level][0].email, usersByLevel()[level][0].password)
    );

    beforeEach(() =>
      // For each of the tests, ensure we stay logged in
      Cypress.Cookies.preserveOnce('keystone.sid')
    );

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
