// We don't want to actually run webpack, so we mock all the bits out
jest.doMock('webpack', () => {
  const mock = jest.fn(() => {});
  mock.HotModuleReplacementPlugin = jest.fn(() => {});
  mock.DefinePlugin = jest.fn(() => {});
  return mock;
});

jest.doMock('webpack-dev-middleware', () => {
  return jest.fn(() => () => {});
});

jest.doMock('webpack-hot-middleware', () => {
  return jest.fn(() => () => {});
});

jest.doMock('html-webpack-plugin', () => {
  return jest.fn(() => {});
});

const AdminUI = require('../../server/AdminUI.js');

const keystone = {
  sessionManager: {},
  getAdminSchema: jest.fn(),
  getAdminMeta: jest.fn(),
};
const adminPath = 'admin_path';

test('new AdminUI() - smoke test', () => {
  const adminUI = new AdminUI(keystone, { adminPath });
  expect(adminUI).not.toBe(null);

  expect(adminUI.keystone).toEqual(keystone);
  expect(adminUI.adminPath).toEqual(adminPath);
});

describe('Add Middleware', () => {
  test('Smoke test', () => {
    const adminUI = new AdminUI(keystone, {
      adminPath,
      signinPath: '/signin',
      signoutPath: '/signout',
      sessionPath: '/session',
    });

    //expect(adminUI.createSessionMiddleware()).not.toBe(null);
    expect(
      adminUI.createDevMiddleware({
        apiPath: adminPath,
        graphiqlPath: `${adminPath}/graphiql`,
      })
    ).not.toBe(null);
  });
});
