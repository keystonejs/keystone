import { Request, Response, NextFunction } from 'express';
import { AppVersionProvider, appVersionMiddleware } from '../src/app-version';

describe('AppVersionProvider', () => {
  test('AppVersionProvider - simple access', async () => {
    const appVersion = new AppVersionProvider({
      version: '1.0.0',
      access: true,
      schemaNames: ['public'],
    });

    let schemaName = 'public' as const;
    expect(appVersion.getTypes({ schemaName })).toEqual([]);
    expect(appVersion.getQueries({ schemaName })).toEqual([
      `"""The version of the Keystone application serving this API."""
          appVersion: String`,
    ]);
    expect(appVersion.getMutations({ schemaName })).toEqual([]);
    expect(appVersion.getSubscriptions({ schemaName })).toEqual([]);
    expect(appVersion.getTypeResolvers({ schemaName })).toEqual({});
    expect(appVersion.getQueryResolvers({ schemaName })).toHaveProperty('appVersion');
    expect(appVersion.getQueryResolvers({ schemaName }).appVersion?.()).toEqual('1.0.0');
    expect(appVersion.getMutationResolvers({ schemaName })).toEqual({});
    expect(appVersion.getSubscriptionResolvers({ schemaName })).toEqual({});

    // @ts-ignore
    schemaName = 'other';
    expect(appVersion.getTypes({ schemaName })).toEqual([]);
    expect(appVersion.getQueries({ schemaName })).toEqual([]);
    expect(appVersion.getMutations({ schemaName })).toEqual([]);
    expect(appVersion.getSubscriptions({ schemaName })).toEqual([]);
    expect(appVersion.getTypeResolvers({ schemaName })).toEqual({});
    expect(appVersion.getQueryResolvers({ schemaName })).toEqual({});
    expect(appVersion.getMutationResolvers({ schemaName })).toEqual({});
    expect(appVersion.getSubscriptionResolvers({ schemaName })).toEqual({});
  });

  test('AppVersionProvider - complex access', async () => {
    const appVersion = new AppVersionProvider({
      version: '1.0.0',
      access: { public: true, other: false },
      schemaNames: ['public', 'other'],
    });

    let schemaName = 'public' as const;
    expect(appVersion.getTypes({ schemaName })).toEqual([]);
    expect(appVersion.getQueries({ schemaName })).toEqual([
      `"""The version of the Keystone application serving this API."""
          appVersion: String`,
    ]);
    expect(appVersion.getMutations({ schemaName })).toEqual([]);
    expect(appVersion.getTypeResolvers({ schemaName })).toEqual({});
    expect(appVersion.getQueryResolvers({ schemaName })).toHaveProperty('appVersion');
    expect(appVersion.getQueryResolvers({ schemaName }).appVersion?.()).toEqual('1.0.0');
    expect(appVersion.getMutationResolvers({ schemaName })).toEqual({});

    // @ts-ignore
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

    const req = {} as Request;
    // @ts-ignore
    const res = { set: jest.fn() } as Response;
    const next = jest.fn() as NextFunction;

    middleware(req, res, next);
    expect(res.set).toHaveBeenCalledWith('X-Keystone-App-Version', '1.0.0');
    expect(next).toHaveBeenCalled();
  });
});
