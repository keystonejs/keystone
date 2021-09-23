import { KeystoneContext } from '@keystone-next/keystone/types';
import { setupTestEnv, TestEnv } from '@keystone-next/keystone/testing';
import {
  getOperationListName,
  listAccessVariations,
  getItemListName,
  getFilterListName,
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
    items[listKey] = (await context.query[listKey].createMany({
      data: _items,
      query: 'id name',
    })) as T;
  }
  const user = (await context.query.User.createOne({
    data: { name: 'test', yesRead: 'yes', noRead: 'no' },
    query: 'id name yesRead noRead',
  })) as { id: IdType; name: string; yesRead: string; noRead: string };
  return { items, user };
};

describe('Authed', () => {
  let testEnv: TestEnv, context: KeystoneContext;
  let user: { id: IdType; name: string; yesRead: string; noRead: string };
  beforeAll(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;

    await testEnv.connect();

    const result = await afterConnect({ context });
    user = result.user;
  });
  afterAll(async () => {
    await testEnv.disconnect();
  });

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
    expect(errors).toBe(undefined);
  });
});
