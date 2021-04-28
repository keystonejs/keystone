import { GraphQLError } from 'graphql';
import { multiAdapterRunners } from '@keystone-next/test-utils-legacy';
import { KeystoneContext } from '@keystone-next/types';
import {
  FAKE_ID,
  FAKE_ID_2,
  getStaticListName,
  listAccessVariations,
  fieldMatrix,
  getImperativeListName,
  getDeclarativeListName,
  getFieldName,
  nameFn,
  setupKeystone,
} from './utils';

type IdType = any;

const expectNoAccess = <N extends string>(
  data: Record<N, null> | null | undefined,
  errors: readonly GraphQLError[] | undefined,
  name: N
) => {
  expect(data?.[name]).toBe(null);
  expect(errors).toHaveLength(1);
  const error = errors![0];
  expect(error.message).toEqual('You do not have access to this resource');
  expect(error.path).toHaveLength(1);
  expect(error.path![0]).toEqual(name);
};

const expectNamedArray = <T extends { id: IdType }, N extends string>(
  data: Record<N, { id: any }[]> | null | undefined,
  errors: readonly GraphQLError[] | undefined,
  name: N,
  values: T[]
) => {
  expect(errors).toBe(undefined);
  expect(data?.[name]).toHaveLength(values.length);
  const sortedData = data![name].map(({ id }) => id).sort();
  values.sort().forEach((value, i) => {
    expect(sortedData[i]).toEqual(value);
  });
};

multiAdapterRunners().map(({ before, after, provider }) =>
  describe(`Provider: ${provider}`, () => {
    let keystone: any,
      items: Record<string, { id: IdType; name: string }[]>,
      user: { id: IdType; name: string; yesRead: string; noRead: string },
      context: KeystoneContext;
    beforeAll(async () => {
      const _before = await before(setupKeystone);
      keystone = _before.keystone;
      context = _before.context;

      // ensure every list has at least some data
      const initialData: Record<string, { name: string }[]> = listAccessVariations.reduce(
        (acc, access) =>
          Object.assign(acc, {
            [getStaticListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
            [getImperativeListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
            [getDeclarativeListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
          }),
        {}
      );

      items = {};
      for (const [listKey, _items] of Object.entries(initialData)) {
        items[listKey] = (await context.lists[listKey].createMany({
          data: _items.map(x => ({ data: x })),
          query: 'id, name',
        })) as { id: IdType; name: string }[];
      }
      user = (await context.lists.User.createOne({
        data: { name: 'test', yesRead: 'yes', noRead: 'no' },
        query: 'id name yesRead noRead',
      })) as { id: IdType; name: string; yesRead: string; noRead: string };
    });
    afterAll(async () => {
      await after(keystone);
    });

    describe('create', () => {
      (['imperative'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ create }) => create)
            .forEach(access => {
              test(`allowed: ${JSON.stringify(access)}`, async () => {
                const listKey = nameFn[mode](access);
                const data = { name: 'bar' };
                const item = await context.exitSudo().lists[listKey].createOne({ data });
                expect(item).not.toBe(null);
                expect(item.id).not.toBe(null);
                await context.lists[listKey].deleteOne({ id: item.id });
              });
            });
        });
      });
      (['static'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ create }) => create)
            .forEach(access => {
              test(`field allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                };
                const listKey = nameFn[mode](listAccess);
                const fieldName = getFieldName(access);
                const item = await context.exitSudo().lists[listKey].createOne({
                  data: { [fieldName]: 'bar' },
                  query: `id ${access.read ? fieldName : ''}`,
                });
                expect(item).not.toBe(null);
                expect(item.id).not.toBe(null);
                if (access.read) {
                  expect(item[fieldName]).toBe('bar');
                } else {
                  expect(item[fieldName]).toBe(undefined);
                }
                await context.lists[listKey].deleteOne({ id: item.id });
              });
            });
        });
      });
      (['imperative'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ create }) => create)
            .forEach(access => {
              test(`field allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                };
                const listKey = nameFn[mode](listAccess);
                const fieldName = getFieldName(access);
                const item = await context
                  .exitSudo()
                  .lists[listKey].createOne({ data: { [fieldName]: 'bar' } });
                expect(item).not.toBe(null);
                expect(item.id).not.toBe(null);
                await context.lists[listKey].deleteOne({ id: item.id });
              });
            });
        });
      });
    });

    describe('read', () => {
      test('authed user', async () => {
        const query = `query { authenticatedItem { ... on User { id yesRead noRead } } }`;
        const _context = await context.exitSudo().withSession({
          itemId: user.id,
          listKey: 'User',
          data: user,
        });
        const { data, errors } = await _context.graphql.raw({ query });
        expect(data?.authenticatedItem).not.toBe(null);
        expect(data?.authenticatedItem.id).toEqual(user.id);
        expect(data?.authenticatedItem.yesRead).toEqual(user.yesRead);
        expect(data?.authenticatedItem.noRead).toEqual(null);
        expect(errors).toHaveLength(1);
        expect(errors![0].name).toEqual('GraphQLError');
        expect(errors![0].message).toEqual('You do not have access to this resource');
        expect(errors![0].path).toEqual(['authenticatedItem', 'noRead']);
      });

      (['imperative', 'declarative'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ read }) => read)
            .forEach(access => {
              const listKey = nameFn[mode](access);

              test(`'all' allowed: ${JSON.stringify(access)}`, async () => {
                const _items = await context.exitSudo().lists[listKey].findMany();
                if (mode === 'imperative') {
                  expect(_items).toHaveLength(2);
                } else {
                  expect(_items).toHaveLength(1); // We can only read the ones our permission filter allow
                }
              });

              test(`meta allowed: ${JSON.stringify(access)}`, async () => {
                const count = await context.exitSudo().lists[listKey].count();
                if (mode === 'imperative') {
                  expect(count).toEqual(2);
                } else {
                  expect(count).toEqual(1); // We can only read the ones our permission filter allow
                }
              });

              test(`single allowed: ${JSON.stringify(access)}`, async () => {
                const validId = items[listKey].find(({ name }) => name === 'Hello')?.id;
                const item = await context
                  .exitSudo()
                  .lists[listKey].findOne({ where: { id: validId } });
                expect(item).not.toBe(null);
                expect(item.id).toEqual(validId);
              });

              test(`single not allowed: ${JSON.stringify(access)}`, async () => {
                const invalidId = items[listKey].find(({ name }) => name !== 'Hello')?.id;
                const query = `query { ${listKey}(where: { id: "${invalidId}" }) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                if (mode === 'imperative') {
                  // Imperative should work
                  expect(errors).toBe(undefined);
                  expect(data?.[listKey]).not.toBe(null);
                  expect(data?.[listKey].id).toEqual(invalidId);
                } else {
                  // but declarative should not
                  expectNoAccess(data, errors, listKey);
                }
              });

              test(`single not existing: ${JSON.stringify(access)}`, async () => {
                const query = `query { ${listKey}(where: { id: "${FAKE_ID[provider]}" }) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expectNoAccess(data, errors, listKey);
              });

              test(`multiple not existing: ${JSON.stringify(access)}`, async () => {
                const _items = await context.exitSudo().lists[listKey].findMany({
                  where: { id_in: [FAKE_ID[provider], FAKE_ID_2[provider]] },
                });
                expect(_items).toHaveLength(0);
              });
            });
        });
      });
      (['imperative', 'static'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ read }) => read)
            .forEach(access => {
              test(`field allowed - singular: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                await context.lists[listKey].updateOne({
                  id: item.id,
                  data: { [fieldName]: 'hello' },
                });
                const _item = await context
                  .exitSudo()
                  .lists[listKey].findOne({ where: { id: item.id }, query: `id ${fieldName}` });
                expect(_item).not.toBe(null);
                expect(_item.id).not.toBe(null);
                expect(_item[fieldName]).toBe('hello');
              });
              test(`field allowed - multi: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                await context.lists[listKey].updateOne({
                  id: item.id,
                  data: { [fieldName]: 'hello' },
                });
                const _items = await context
                  .exitSudo()
                  .lists[listKey].findMany({ query: `id ${fieldName}` });
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
      (['imperative', 'declarative'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ update }) => update)
            .forEach(access => {
              test(`denies missing: ${JSON.stringify(access)}`, async () => {
                const updateMutationName = `update${nameFn[mode](access)}`;
                const query = `mutation { ${updateMutationName}(id: "${FAKE_ID[provider]}", data: { name: "bar" }) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expectNoAccess(data, errors, updateMutationName);
              });

              test(`denies by declarative: ${JSON.stringify(access)}`, async () => {
                const updateMutationName = `update${nameFn[mode](access)}`;
                const singleQueryName = nameFn[mode](access);
                const invalidId = items[singleQueryName].find(({ name }) => name !== 'Hello')?.id;
                const query = `mutation { ${updateMutationName}(id: "${invalidId}", data: { name: "bar" }) { id name } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                if (mode === 'imperative') {
                  expect(errors).toBe(undefined);
                  expect(data?.[updateMutationName]).not.toBe(null);
                  expect(data?.[updateMutationName].id).toEqual(invalidId);
                  expect(data?.[updateMutationName].name).toEqual('bar');
                  // Reset data
                  await context.graphql.raw({
                    query: `mutation { ${updateMutationName}(id: "${invalidId}", data: { name: "Hello" }) { id name } }`,
                  });
                } else {
                  expectNoAccess(data, errors, updateMutationName);
                }
              });

              test(`allows: ${JSON.stringify(access)}`, async () => {
                const updateMutationName = `update${nameFn[mode](access)}`;
                const singleQueryName = nameFn[mode](access);
                const listKey = nameFn[mode](access);
                const validId = items[singleQueryName].find(({ name }) => name === 'Hello')?.id;
                const item = await context.exitSudo().lists[listKey].updateOne({
                  id: validId,
                  data: { name: 'bar' },
                  query: 'id name',
                });
                expect(item).not.toBe(null);
                expect(item.id).toEqual(validId);
                expect(item.name).toEqual('bar');
                // Reset data
                await context.graphql.raw({
                  query: `mutation { ${updateMutationName}(id: "${validId}", data: { name: "Hello" }) { id name } }`,
                });
              });
            });
        });
      });
      (['static'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ update }) => update)
            .forEach(access => {
              test(`field allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const _item = await context.exitSudo().lists[listKey].updateOne({
                  id: item.id,
                  data: { [fieldName]: 'bar' },
                  query: `id ${access.read ? fieldName : ''}`,
                });
                expect(_item).not.toBe(null);
                expect(_item.id).not.toBe(null);
                if (access.read) {
                  expect(_item[fieldName]).toBe('bar');
                } else {
                  expect(_item[fieldName]).toBe(undefined);
                }
              });
            });
        });
      });
      (['imperative'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ update }) => update)
            .forEach(access => {
              test(`field allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const _item = await context
                  .exitSudo()
                  .lists[listKey].updateOne({ id: item.id, data: { [fieldName]: 'bar' } });
                expect(_item).not.toBe(null);
                expect(_item.id).not.toBe(null);
              });
            });
        });
      });
    });

    describe('delete', () => {
      (['imperative', 'declarative'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(access => access.delete)
            .forEach(access => {
              const create = async (data: { name: string }) =>
                context.lists[nameFn[mode](access)].createOne({ data });
              test(`single allowed: ${JSON.stringify(access)}`, async () => {
                const { id } = await create({ name: 'Hello' });
                const deleted = await context
                  .exitSudo()
                  .lists[nameFn[mode](access)].deleteOne({ id });
                expect(deleted).not.toBe(null);
                expect(deleted!.id).toEqual(id);
              });

              test(`single denies: ${JSON.stringify(access)}`, async () => {
                const { id: invalidId } = await create({ name: 'hi' });
                const deleteMutationName = `delete${nameFn[mode](access)}`;
                const query = `mutation { ${deleteMutationName}(id: "${invalidId}") { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                if (mode === 'imperative') {
                  expect(errors).toBe(undefined);
                  expect(data?.[deleteMutationName]).not.toBe(null);
                  expect(data?.[deleteMutationName].id).toEqual(invalidId);
                } else {
                  expectNoAccess(data, errors, deleteMutationName);
                }
              });

              test(`single denies missing: ${JSON.stringify(access)}`, async () => {
                const deleteMutationName = `delete${nameFn[mode](access)}`;
                const query = `mutation { ${deleteMutationName}(id: "${FAKE_ID[provider]}") { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expectNoAccess(data, errors, deleteMutationName);
              });

              test(`multi allowed: ${JSON.stringify(access)}`, async () => {
                const { id: validId1 } = await create({ name: 'Hello' });
                const { id: validId2 } = await create({ name: 'Hello' });
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const query = `mutation { ${multiDeleteMutationName}(ids: ["${validId1}", "${validId2}"]) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expectNamedArray(data, errors, multiDeleteMutationName, [validId1, validId2]);
              });

              test(`multi denies: ${JSON.stringify(access)}`, async () => {
                const { id: validId1 } = await create({ name: 'hi' });
                const { id: validId2 } = await create({ name: 'hi' });
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const query = `mutation { ${multiDeleteMutationName}(ids: ["${validId1}", "${validId2}"]) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                if (mode === 'imperative') {
                  expectNamedArray(data, errors, multiDeleteMutationName, [validId1, validId2]);
                } else {
                  expectNamedArray(data, errors, multiDeleteMutationName, []);
                }
              });

              test(`multi mixed allows/denies: ${JSON.stringify(access)}`, async () => {
                const { id: validId1 } = await create({ name: 'Hello' });
                const { id: validId2 } = await create({ name: 'hi' });
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const query = `mutation { ${multiDeleteMutationName}(ids: ["${validId1}", "${validId2}"]) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                if (mode === 'imperative') {
                  expectNamedArray(data, errors, multiDeleteMutationName, [validId1, validId2]);
                } else {
                  expectNamedArray(data, errors, multiDeleteMutationName, [validId1]);
                }
              });

              test(`multi denies missing: ${JSON.stringify(access)}`, async () => {
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const query = `mutation { ${multiDeleteMutationName}(ids: ["${FAKE_ID[provider]}", "${FAKE_ID_2[provider]}"]) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expectNamedArray(data, errors, multiDeleteMutationName, []);
              });
            });
        });
      });
    });
  })
);
