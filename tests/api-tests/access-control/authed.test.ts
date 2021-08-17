import { KeystoneContext } from '@keystone-next/keystone/types';
import { setupTestEnv, TestEnv } from '@keystone-next/keystone/testing';
import { expectAccessDenied } from '../utils';
import {
  getOperationListName,
  listAccessVariations,
  fieldMatrix,
  getItemListName,
  getFilterListName,
  getFieldName,
  nameFn,
  config,
  getFilterBoolListName,
} from './utils';

type IdType = any;

const afterConnect = async ({ context }: { context: KeystoneContext }) => {
  context = context.sudo();
  // ensure every list has at least some data
  const initialData: Record<string, { name: string }[]> = listAccessVariations.reduce(
    (acc, access) =>
      Object.assign(acc, {
        [getOperationListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
        [getItemListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
        [getFilterListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
        [getFilterBoolListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
      }),
    {}
  );

  type T = { id: IdType; name: string }[];
  const items: Record<string, T> = {};
  for (const [listKey, _items] of Object.entries(initialData)) {
    items[listKey] = (await context.lists[listKey].createMany({
      data: _items,
      query: 'id name',
    })) as T;
  }
  const user = (await context.lists.User.createOne({
    data: { name: 'test', yesRead: 'yes', noRead: 'no' },
    query: 'id name yesRead noRead',
  })) as { id: IdType; name: string; yesRead: string; noRead: string };
  return { items, user };
};

describe('Authed', () => {
  let testEnv: TestEnv, context: KeystoneContext;
  let items: Record<string, { id: IdType; name: string }[]> = {};
  let user: { id: IdType; name: string; yesRead: string; noRead: string };
  beforeAll(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;

    await testEnv.connect();

    const result = await afterConnect({ context });
    items = result.items;
    user = result.user;
  });
  afterAll(async () => {
    await testEnv.disconnect();
  });

  describe('List access', () => {
    describe('query', () => {
      test('authed user', async () => {
        const query = `query { authenticatedItem { ... on User { id yesRead noRead } } }`;
        const _context = await context.withSession({
          itemId: user.id,
          listKey: 'User',
          data: user,
        });
        const { data, errors } = await _context.graphql.raw({ query });
        expect(data).toEqual({
          authenticatedItem: { id: user.id, yesRead: user.yesRead, noRead: null },
        });
        expectAccessDenied('dev', false, undefined, errors, [
          { path: ['authenticatedItem', 'noRead'] },
        ]);
      });
    });
  });

  describe('Field access', () => {
    describe('create', () => {
      (['operation'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ create }) => create)
            .forEach(access => {
              test(`field allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = { create: true, query: true, update: true, delete: true };
                const listKey = nameFn[mode](listAccess);
                const fieldName = getFieldName(access);
                const item = await context.lists[listKey].createOne({
                  data: { [fieldName]: 'bar' },
                  query: `id ${access.query ? fieldName : ''}`,
                });
                expect(item).not.toBe(null);
                expect(item.id).not.toBe(null);
                if (access.query) {
                  expect(item[fieldName]).toBe('bar');
                } else {
                  expect(item[fieldName]).toBe(undefined);
                }
                await context.sudo().lists[listKey].deleteOne({ where: { id: item.id } });
              });
            });
        });
      });
      (['item'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ create }) => create)
            .forEach(access => {
              test(`field allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = { create: true, query: true, update: true, delete: true };
                const listKey = nameFn[mode](listAccess);
                const fieldName = getFieldName(access);
                const item = await context.lists[listKey].createOne({
                  data: { [fieldName]: 'bar' },
                });
                expect(item).not.toBe(null);
                expect(item.id).not.toBe(null);
                await context.sudo().lists[listKey].deleteOne({ where: { id: item.id } });
              });
            });
        });
      });
    });

    describe('read', () => {
      (['item', 'operation'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ query }) => query)
            .forEach(access => {
              test(`field allowed - singular: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  query: true,
                  update: true,
                  delete: true,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                await context.sudo().lists[listKey].updateOne({
                  where: { id: item.id },
                  data: { [fieldName]: 'hello' },
                });
                const _item = await context.lists[listKey].findOne({
                  where: { id: item.id },
                  query: `id ${fieldName}`,
                });
                expect(_item).not.toBe(null);
                expect(_item.id).not.toBe(null);
                expect(_item[fieldName]).toBe('hello');
              });
              test(`field allowed - multi: ${JSON.stringify(access)}`, async () => {
                const listAccess = { create: true, query: true, update: true, delete: true };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                await context.sudo().lists[listKey].updateOne({
                  where: { id: item.id },
                  data: { [fieldName]: 'hello' },
                });
                const _items = await context.lists[listKey].findMany({ query: `id ${fieldName}` });
                expect(_items).not.toBe(null);
                expect(_items).toHaveLength(2);
                for (const _item of _items) {
                  expect(_item.id).not.toBe(null);
                  if (_item.id === item.id) {
                    expect(_item[fieldName]).toEqual('hello');
                  } else {
                    expect(_item[fieldName]).toEqual(null);
                  }
                }
              });
            });
        });
      });
    });

    describe('update', () => {
      (['operation'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ update }) => update)
            .forEach(access => {
              test(`field allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  query: true,
                  update: true,
                  delete: true,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const _item = await context.lists[listKey].updateOne({
                  where: { id: item.id },
                  data: { [fieldName]: 'bar' },
                  query: `id ${access.query ? fieldName : ''}`,
                });
                expect(_item).not.toBe(null);
                expect(_item.id).not.toBe(null);
                if (access.query) {
                  expect(_item[fieldName]).toBe('bar');
                } else {
                  expect(_item[fieldName]).toBe(undefined);
                }
              });
            });
        });
      });
      (['item'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ update }) => update)
            .forEach(access => {
              test(`field allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = { create: true, query: true, update: true, delete: true };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const _item = await context.lists[listKey].updateOne({
                  where: { id: item.id },
                  data: { [fieldName]: 'bar' },
                });
                expect(_item).not.toBe(null);
                expect(_item.id).not.toBe(null);
              });
            });
        });
      });
    });
  });
});
