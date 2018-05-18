/**
 * @jest-environment node
 */
const AdminUI = require('../../server/AdminUI.js');

const keystone = {
  session: {
    validate: () => jest.fn(),
  },
  getAdminSchema: jest.fn(),
  getAdminMeta: jest.fn(),
};
const adminPath = 'admin_path';
const cookieSecret = 'cookiesecret';

test('new AdminUI() - smoke test', () => {
  const adminUI = new AdminUI(keystone, { adminPath });
  expect(adminUI).not.toBe(null);

  expect(adminUI.keystone).toEqual(keystone);
});

describe('Add Middleware', () => {
  test('Smoke test', () => {
    const adminUI = new AdminUI(keystone, { adminPath });

    expect(adminUI.createSessionMiddleware({ cookieSecret })).not.toBe(null);
    expect(adminUI.createGraphQLMiddleware()).not.toBe(null);
    expect(adminUI.createDevMiddleware()).not.toBe(null);
  });
});
