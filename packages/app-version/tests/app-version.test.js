const { AppVersionProvider, appVersionMiddleware } = require('../lib/app-version');

describe('AppVersionProvider', () => {
  test('AppVersionProvider - simple access', async () => {
    const appVersion = new AppVersionProvider({
      version: '1.0.0',
      access: true,
      schemaNames: ['public'],
    });

    let schemaName = 'public';
    expect(appVersion.getTypes({ schemaName })).toEqual([]);
    expect(appVersion.getQueries({ schemaName })).toEqual([
      `"""The version of the Keystone application serving this API."""
          appVersion: String`,
    ]);
    expect(appVersion.getMutations({ schemaName })).toEqual([]);
    expect(appVersion.getTypeResolvers({ schemaName })).toEqual({});
    expect(appVersion.getQueryResolvers({ schemaName })).toHaveProperty('appVersion');
    expect(appVersion.getQueryResolvers({ schemaName }).appVersion()).toEqual('1.0.0');
    expect(appVersion.getMutationResolvers({ schemaName })).toEqual({});

    schemaName = 'other';
    expect(appVersion.getTypes({ schemaName })).toEqual([]);
    expect(appVersion.getQueries({ schemaName })).toEqual([]);
    expect(appVersion.getMutations({ schemaName })).toEqual([]);
    expect(appVersion.getTypeResolvers({ schemaName })).toEqual({});
    expect(appVersion.getQueryResolvers({ schemaName })).toEqual({});
    expect(appVersion.getMutationResolvers({ schemaName })).toEqual({});
  });

  test('AppVersionProvider - complex access', async () => {
    const appVersion = new AppVersionProvider({
      version: '1.0.0',
      access: { public: true, other: false },
      schemaNames: ['public', 'other'],
    });

    let schemaName = 'public';
    expect(appVersion.getTypes({ schemaName })).toEqual([]);
    expect(appVersion.getQueries({ schemaName })).toEqual([
      `"""The version of the Keystone application serving this API."""
          appVersion: String`,
    ]);
    expect(appVersion.getMutations({ schemaName })).toEqual([]);
    expect(appVersion.getTypeResolvers({ schemaName })).toEqual({});
    expect(appVersion.getQueryResolvers({ schemaName })).toHaveProperty('appVersion');
    expect(appVersion.getQueryResolvers({ schemaName }).appVersion()).toEqual('1.0.0');
    expect(appVersion.getMutationResolvers({ schemaName })).toEqual({});

    schemaName = 'other';
    expect(appVersion.getTypes({ schemaName })).toEqual([]);
    expect(appVersion.getQueries({ schemaName })).toEqual([]);
    expect(appVersion.getMutations({ schemaName })).toEqual([]);
    expect(appVersion.getTypeResolvers({ schemaName })).toEqual({});
    expect(appVersion.getQueryResolvers({ schemaName })).toEqual({});
    expect(appVersion.getMutationResolvers({ schemaName })).toEqual({});
  });
});

describe('appVersionMiddleware', () => {
  test('appVersionMiddleware', async () => {
    const middleware = appVersionMiddleware('1.0.0');

    const req = {};
    const res = { set: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);
    expect(res.set).toHaveBeenCalledWith('X-Keystone-App-Version', '1.0.0');
    expect(next).toHaveBeenCalled();
  });
});
