import { GraphQLError } from 'graphql';
import { DatabaseProvider, KeystoneContext } from '@keystone-next/keystone/types';
import { setupTestEnv, TestEnv } from '@keystone-next/keystone/testing';
import { expectAccessDenied } from '../utils';
import {
  nameFn,
  listAccessVariations,
  fieldMatrix,
  getFieldName,
  getOperationListName,
  getItemListName,
  getFilterListName,
  config,
  getFilterBoolListName,
  FAKE_ID,
  FAKE_ID_2,
} from './utils';

const expectNoAccess = <N extends string>(
  data: Record<N, null> | null | undefined,
  errors: readonly GraphQLError[] | undefined,
  name: N,
  httpQuery: boolean
) => {
  expect(data?.[name]).toBe(null);
  expectAccessDenied('dev', httpQuery, undefined, errors, [{ path: [name] }]);
};

const expectNoAccessMany = <N extends string>(
  data: Record<N, null> | null | undefined,
  errors: readonly GraphQLError[] | undefined,
  name: N,
  httpQuery: boolean
) => {
  expect(data?.[name]).toEqual([null]);
  expectAccessDenied('dev', httpQuery, undefined, errors, [{ path: [name, 0] }]);
};

type IdType = any;

describe(`Not authed`, () => {
  let testEnv: TestEnv, context: KeystoneContext, provider: DatabaseProvider;
  let items: Record<string, { id: IdType; name: string }[]>;
  beforeAll(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;
    provider = config.db.provider!;

    await testEnv.connect();

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
    items = {};
    for (const [listKey, _items] of Object.entries(initialData)) {
      items[listKey] = (await context.sudo().lists[listKey].createMany({
        data: _items,
        query: 'id, name',
      })) as { id: IdType; name: string }[];
    }
  });
  afterAll(async () => {
    await testEnv.disconnect();
  });

  describe('List access', () => {
    describe('create', () => {
      (['operation', 'item'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations.forEach(access => {
            test(`denied: - single - ${JSON.stringify(access)}`, async () => {
              const listKey = nameFn[mode](access);
              const createMutationName = `create${listKey}`;
              const query = `mutation { ${createMutationName}(data: { name: "bar" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              if (!access.create) {
                expectNoAccess(data, errors, createMutationName, false);
              } else {
                expect(errors).toBe(undefined);
                expect(data![createMutationName]).not.toEqual(null);
                await context.sudo().lists[listKey].deleteOne({
                  where: { id: data![createMutationName].id },
                });
              }
            });
            test(`denied: - many - ${JSON.stringify(access)}`, async () => {
              const listKey = nameFn[mode](access);
              const createMutationName = `create${listKey}s`;
              const query = `mutation { ${createMutationName}(data: [{ name: "bar" }]) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              if (!access.create) {
                expectNoAccessMany(data, errors, createMutationName, false);
              } else {
                expect(errors).toBe(undefined);
                expect(data![createMutationName]).not.toEqual(null);
                await context.sudo().lists[listKey].deleteOne({
                  where: { id: data![createMutationName][0].id },
                });
              }
            });
          });
        });
      });
    });

    describe('query', () => {
      (['operation', 'filterBool'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations.forEach(access => {
            test(`single not existing: ${JSON.stringify(access)}`, async () => {
              const { itemQueryName } = context.gqlNames(nameFn[mode](access));
              const query = `query { ${itemQueryName}(where: { id: "${FAKE_ID[provider]}" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(errors).toBe(undefined);
              expect(data![itemQueryName]).toBe(null);
            });
            test(`multiple not existing: ${JSON.stringify(access)}`, async () => {
              const _items = await context.lists[nameFn[mode](access)].findMany({
                where: { id: { in: [FAKE_ID[provider], FAKE_ID_2[provider]] } },
              });
              expect(_items).toHaveLength(0);
            });
            test(`'all' denied: ${JSON.stringify(access)}`, async () => {
              const allQueryName = context.gqlNames(nameFn[mode](access)).listQueryName;
              const query = `query { ${allQueryName} { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(errors).toBe(undefined);
              if (!access.query) {
                expect(data![allQueryName]).toHaveLength(0);
              } else {
                expect(data![allQueryName]).toHaveLength(2);
              }
            });

            test(`count denied: ${JSON.stringify(access)}`, async () => {
              const countName = `${
                nameFn[mode](access).slice(0, 1).toLowerCase() + nameFn[mode](access).slice(1)
              }sCount`;
              const query = `query { ${countName} }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(errors).toBe(undefined);
              if (!access.query) {
                expect(data![countName]).toEqual(0);
              } else {
                expect(data![countName]).toEqual(2);
              }
            });

            test(`single denied: ${JSON.stringify(access)}`, async () => {
              const item = await context.sudo().lists[nameFn[mode](access)].createOne({ data: {} });
              const singleQueryName = context.gqlNames(nameFn[mode](access)).itemQueryName;
              const query = `query { ${singleQueryName}(where: { id: "${item.id}" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(errors).toBe(undefined);
              if (!access.query) {
                expect(data![singleQueryName]).toBe(null);
              } else {
                expect(data![singleQueryName]).toEqual({ id: item.id });
              }
              await context
                .sudo()
                .lists[nameFn[mode](access)].deleteOne({ where: { id: item.id } });
            });
          });
        });
      });
      (['filter'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations.forEach(access => {
            test(`single not existing: ${JSON.stringify(access)}`, async () => {
              const { itemQueryName } = context.gqlNames(nameFn[mode](access));
              const query = `query { ${itemQueryName}(where: { id: "${FAKE_ID[provider]}" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(errors).toBe(undefined);
              expect(data![itemQueryName]).toBe(null);
            });
            test(`multiple not existing: ${JSON.stringify(access)}`, async () => {
              const _items = await context.lists[nameFn[mode](access)].findMany({
                where: { id: { in: [FAKE_ID[provider], FAKE_ID_2[provider]] } },
              });
              expect(_items).toHaveLength(0);
            });

            test(`'all' denied: ${JSON.stringify(access)}`, async () => {
              const allQueryName = context.gqlNames(nameFn[mode](access)).listQueryName;
              const query = `query { ${allQueryName} { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(errors).toBe(undefined);
              if (!access.query) {
                expect(data![allQueryName]).toHaveLength(0);
              } else {
                expect(data![allQueryName]).toHaveLength(1);
              }
            });

            test(`count denied: ${JSON.stringify(access)}`, async () => {
              const countName = `${
                nameFn[mode](access).slice(0, 1).toLowerCase() + nameFn[mode](access).slice(1)
              }sCount`;
              const query = `query { ${countName} }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(errors).toBe(undefined);
              if (!access.query) {
                expect(data![countName]).toEqual(0);
              } else {
                expect(data![countName]).toEqual(1);
              }
            });

            test(`single denied: ${JSON.stringify(access)}`, async () => {
              const item1 = await context
                .sudo()
                .lists[nameFn[mode](access)].createOne({ data: { name: 'foo' } });
              const item2 = await context
                .sudo()
                .lists[nameFn[mode](access)].createOne({ data: { name: 'Hello' } });
              const singleQueryName = context.gqlNames(nameFn[mode](access)).itemQueryName;

              // Run a query where we expect a filter miss
              const query = `query { ${singleQueryName}(where: { id: "${item1.id}" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(errors).toBe(undefined);
              if (!access.query) {
                expect(data![singleQueryName]).toBe(null);
              } else {
                // Filtered out
                expect(data![singleQueryName]).toBe(null);
              }
              await context
                .sudo()
                .lists[nameFn[mode](access)].deleteOne({ where: { id: item1.id } });

              // Run a query where we expect a filter match
              const _query = `query { ${singleQueryName}(where: { id: "${item2.id}" }) { id } }`;
              const result = await context.graphql.raw({ query: _query });
              expect(result.errors).toBe(undefined);
              if (!access.query) {
                expect(result.data![singleQueryName]).toBe(null);
              } else {
                // Filtered in
                expect(result.data![singleQueryName]).toEqual({ id: item2.id });
              }
              await context
                .sudo()
                .lists[nameFn[mode](access)].deleteOne({ where: { id: item2.id } });
            });
          });
        });
      });
    });

    describe('update', () => {
      (['operation', 'filterBool', 'item'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations.forEach(access => {
            test(`denies missing: ${JSON.stringify(access)}`, async () => {
              const updateMutationName = `update${nameFn[mode](access)}`;
              const query = `mutation { ${updateMutationName}(where: { id: "${FAKE_ID[provider]}" }, data: { name: "bar" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectNoAccess(data, errors, updateMutationName, false);
            });
            test(`denies: - single - ${JSON.stringify(access)}`, async () => {
              const item = await context.sudo().lists[nameFn[mode](access)].createOne({ data: {} });
              const updateMutationName = `update${nameFn[mode](access)}`;
              const query = `mutation { ${updateMutationName}(where: { id: "${item.id}" }, data: { name: "bar" }) { id name } }`;
              const { data, errors } = await context.graphql.raw({ query });
              if (!access.update) {
                expectNoAccess(data, errors, updateMutationName, false);
              } else {
                expect(errors).toBe(undefined);
                expect(data![updateMutationName]).toEqual({ id: item.id, name: 'bar' });
              }

              await context
                .sudo()
                .lists[nameFn[mode](access)].deleteOne({ where: { id: item.id } });
            });
            test(`denies: - many - ${JSON.stringify(access)}`, async () => {
              const item = await context.sudo().lists[nameFn[mode](access)].createOne({ data: {} });
              const updateMutationName = `update${nameFn[mode](access)}s`;
              const query = `mutation { ${updateMutationName}(data: [{ where: { id: "${item.id}" }, data: { name: "bar" } }]) { id name } }`;
              const { data, errors } = await context.graphql.raw({ query });
              if (!access.update) {
                expectNoAccessMany(data, errors, updateMutationName, false);
              } else {
                expect(errors).toBe(undefined);
                expect(data![updateMutationName]).toEqual([{ id: item.id, name: 'bar' }]);
              }
              await context
                .sudo()
                .lists[nameFn[mode](access)].deleteOne({ where: { id: item.id } });
            });
          });
        });
      });
      (['filter'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations.forEach(access => {
            test(`denies missing: ${JSON.stringify(access)}`, async () => {
              const updateMutationName = `update${nameFn[mode](access)}`;
              const query = `mutation { ${updateMutationName}(where: { id: "${FAKE_ID[provider]}" }, data: { name: "bar" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectNoAccess(data, errors, updateMutationName, false);
            });
            test(`denies: - single - ${JSON.stringify(access)}`, async () => {
              const item1 = await context
                .sudo()
                .lists[nameFn[mode](access)].createOne({ data: { name: 'foo' } });
              const item2 = await context
                .sudo()
                .lists[nameFn[mode](access)].createOne({ data: { name: 'Hello' } });

              const updateMutationName = `update${nameFn[mode](access)}`;

              const query = `mutation { ${updateMutationName}(where: { id: "${item1.id}" }, data: { name: "bar" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              if (!access.update) {
                expectNoAccess(data, errors, updateMutationName, false);
              } else {
                // Filtered out
                expectNoAccess(data, errors, updateMutationName, false);
              }
              await context
                .sudo()
                .lists[nameFn[mode](access)].deleteOne({ where: { id: item1.id } });

              const _query = `mutation { ${updateMutationName}(where: { id: "${item2.id}" }, data: { name: "bar" }) { id } }`;
              const result = await context.graphql.raw({ query: _query });
              if (!access.update) {
                expectNoAccess(result.data, result.errors, updateMutationName, false);
              } else {
                // Filtered in
                expect(result.errors).toBe(undefined);
                expect(result.data![updateMutationName]).not.toEqual(null);
              }
              await context
                .sudo()
                .lists[nameFn[mode](access)].deleteOne({ where: { id: item2.id } });
            });
            test(`denies: - many - ${JSON.stringify(access)}`, async () => {
              const item1 = await context
                .sudo()
                .lists[nameFn[mode](access)].createOne({ data: { name: 'foo' } });
              const item2 = await context
                .sudo()
                .lists[nameFn[mode](access)].createOne({ data: { name: 'Hello' } });

              const updateMutationName = `update${nameFn[mode](access)}s`;
              const query = `mutation { ${updateMutationName}(data: [{ where: { id: "${item1.id}" }, data: { name: "bar" } }]) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              if (!access.update) {
                expectNoAccessMany(data, errors, updateMutationName, false);
              } else {
                // Filtered out
                expectNoAccessMany(data, errors, updateMutationName, false);
              }
              await context
                .sudo()
                .lists[nameFn[mode](access)].deleteOne({ where: { id: item1.id } });

              const _query = `mutation { ${updateMutationName}(data: [{ where: { id: "${item2.id}" }, data: { name: "bar" } }]) { id } }`;
              const result = await context.graphql.raw({ query: _query });
              if (!access.update) {
                expectNoAccessMany(result.data, result.errors, updateMutationName, false);
              } else {
                // Filtered in
                expect(result.errors).toBe(undefined);
                expect(result.data![updateMutationName][0]).not.toEqual(null);
              }
              await context
                .sudo()
                .lists[nameFn[mode](access)].deleteOne({ where: { id: item2.id } });
            });
          });
        });
      });
    });

    describe('delete', () => {
      (['operation', 'filterBool', 'item'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations.forEach(access => {
            // FIXME: duped
            test(`single denies missing: ${JSON.stringify(access)}`, async () => {
              const deleteMutationName = `delete${nameFn[mode](access)}`;
              const query = `mutation { ${deleteMutationName}(where: { id: "${FAKE_ID[provider]}" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectNoAccess(data, errors, deleteMutationName, false);
            });
            // FIXME: duped
            test(`multi denies missing: ${JSON.stringify(access)}`, async () => {
              const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
              const query = `mutation { ${multiDeleteMutationName}(where: [{ id: "${FAKE_ID[provider]}" }, { id: "${FAKE_ID_2[provider]}" }]) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectAccessDenied('dev', false, undefined, errors, [
                { path: [multiDeleteMutationName, 0] },
                { path: [multiDeleteMutationName, 1] },
              ]);
              expect(data).toEqual({ [multiDeleteMutationName]: [null, null] });
            });
            test(`single denied: ${JSON.stringify(access)}`, async () => {
              const item = await context.sudo().lists[nameFn[mode](access)].createOne({ data: {} });

              const deleteMutationName = `delete${nameFn[mode](access)}`;
              const query = `mutation { ${deleteMutationName}(where: {id: "${item.id}" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });

              if (!access.delete) {
                expectNoAccess(data, errors, deleteMutationName, false);
              } else {
                expect(errors).toBe(undefined);
                expect(data![deleteMutationName]).not.toEqual(null);
              }
              if (!access.delete) {
                await context
                  .sudo()
                  .lists[nameFn[mode](access)].deleteOne({ where: { id: item.id } });
              }
            });

            test(`multi denied: ${JSON.stringify(access)}`, async () => {
              const item = await context.sudo().lists[nameFn[mode](access)].createOne({ data: {} });

              const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
              const query = `mutation { ${multiDeleteMutationName}(where: [{ id: "${item.id}" }]) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });

              if (!access.delete) {
                expectNoAccessMany(data, errors, multiDeleteMutationName, false);
              } else {
                expect(errors).toBe(undefined);
                expect(data![multiDeleteMutationName]).not.toEqual(null);
              }

              if (!access.delete) {
                await context
                  .sudo()
                  .lists[nameFn[mode](access)].deleteOne({ where: { id: item.id } });
              }
            });
          });
        });
      });
      (['filter'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations.forEach(access => {
            test(`single denies missing: ${JSON.stringify(access)}`, async () => {
              const deleteMutationName = `delete${nameFn[mode](access)}`;
              const query = `mutation { ${deleteMutationName}(where: { id: "${FAKE_ID[provider]}" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectNoAccess(data, errors, deleteMutationName, false);
            });
            test(`multi denies missing: ${JSON.stringify(access)}`, async () => {
              const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
              const query = `mutation { ${multiDeleteMutationName}(where: [{ id: "${FAKE_ID[provider]}" }, { id: "${FAKE_ID_2[provider]}" }]) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectAccessDenied('dev', false, undefined, errors, [
                { path: [multiDeleteMutationName, 0] },
                { path: [multiDeleteMutationName, 1] },
              ]);
              expect(data).toEqual({ [multiDeleteMutationName]: [null, null] });
            });
            test(`single denied: ${JSON.stringify(access)}`, async () => {
              const item1 = await context
                .sudo()
                .lists[nameFn[mode](access)].createOne({ data: { name: 'foo' } });
              const item2 = await context
                .sudo()
                .lists[nameFn[mode](access)].createOne({ data: { name: 'Hello' } });

              const deleteMutationName = `delete${nameFn[mode](access)}`;
              const query = `mutation { ${deleteMutationName}(where: {id: "${item1.id}" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              if (!access.delete) {
                expectNoAccess(data, errors, deleteMutationName, false);
              } else {
                // Filtered out
                expectNoAccess(data, errors, deleteMutationName, false);
              }

              if (!access.delete) {
                await context
                  .sudo()
                  .lists[nameFn[mode](access)].deleteOne({ where: { id: item1.id } });
              }

              const _query = `mutation { ${deleteMutationName}(where: {id: "${item2.id}" }) { id } }`;
              const result = await context.graphql.raw({ query: _query });
              if (!access.delete) {
                expectNoAccess(result.data, result.errors, deleteMutationName, false);
              } else {
                // Filtered in
                expect(result.errors).toBe(undefined);
                expect(result.data![deleteMutationName]).not.toEqual(null);
              }

              if (!access.delete) {
                await context
                  .sudo()
                  .lists[nameFn[mode](access)].deleteOne({ where: { id: item2.id } });
              }
            });

            test(`multi denied: ${JSON.stringify(access)}`, async () => {
              const item1 = await context
                .sudo()
                .lists[nameFn[mode](access)].createOne({ data: { name: 'foo' } });
              const item2 = await context
                .sudo()
                .lists[nameFn[mode](access)].createOne({ data: { name: 'Hello' } });

              const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
              const query = `mutation { ${multiDeleteMutationName}(where: [{ id: "${item1.id}" }]) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              if (!access.delete) {
                expectNoAccessMany(data, errors, multiDeleteMutationName, false);
              } else {
                // Filtered out
                expectNoAccessMany(data, errors, multiDeleteMutationName, false);
              }
              if (!access.delete) {
                await context
                  .sudo()
                  .lists[nameFn[mode](access)].deleteOne({ where: { id: item1.id } });
              }

              const _query = `mutation { ${multiDeleteMutationName}(where: [{ id: "${item2.id}" }]) { id } }`;
              const result = await context.graphql.raw({ query: _query });
              if (!access.delete) {
                expectNoAccessMany(result.data, result.errors, multiDeleteMutationName, false);
              } else {
                // Filtered in
                expect(result.errors).toBe(undefined);
                expect(result.data![multiDeleteMutationName]).not.toEqual(null);
              }
              if (!access.delete) {
                await context
                  .sudo()
                  .lists[nameFn[mode](access)].deleteOne({ where: { id: item2.id } });
              }
            });
          });
        });
      });
    });
  });

  describe('Field access', () => {
    const listAccess = { create: true, query: true, update: true, delete: true };
    const mode = 'item';
    const listKey = nameFn[mode](listAccess);
    describe('create', () => {
      describe(mode, () => {
        fieldMatrix
          .filter(({ create }) => !create)
          .forEach(access => {
            test(`field not allowed: ${JSON.stringify(access)}`, async () => {
              const createMutationName = `create${nameFn[mode](listAccess)}`;
              const fieldName = getFieldName(access);
              const query = `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(data).toEqual({ [createMutationName]: null });
              expectAccessDenied('dev', false, undefined, errors, [{ path: [createMutationName] }]);
            });
          });
      });
    });

    describe('query', () => {
      describe(mode, () => {
        fieldMatrix
          .filter(({ query }) => !query)
          .forEach(access => {
            test(`field allowed - singular: ${JSON.stringify(access)}`, async () => {
              const item = items[listKey][0];
              const fieldName = getFieldName(access);
              const singleQueryName = context.gqlNames(listKey).itemQueryName;
              await context.sudo().lists[listKey].updateOne({
                where: { id: item.id },
                data: { [fieldName]: 'hello' },
              });
              const query = `query { ${singleQueryName}(where: { id: "${item.id}" }) { id ${fieldName} } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectAccessDenied('dev', false, undefined, errors, [
                { path: [singleQueryName, fieldName] },
              ]);
              expect(data).toEqual({ [singleQueryName]: { id: item.id, [fieldName]: null } });
            });
            test(`field allowed - multi: ${JSON.stringify(access)}`, async () => {
              const item = items[listKey][0];
              const fieldName = getFieldName(access);
              const allQueryName = context.gqlNames(listKey).listQueryName;
              await context.sudo().lists[listKey].updateOne({
                where: { id: item.id },
                data: { [fieldName]: 'hello' },
              });
              const query = `query { ${allQueryName} { id ${fieldName} } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectAccessDenied('dev', false, undefined, errors, [
                { path: [allQueryName, 0, fieldName] },
                { path: [allQueryName, 1, fieldName] },
              ]);
              expect(data).toEqual({
                [allQueryName]: [
                  { id: expect.any(String), [fieldName]: null },
                  { id: expect.any(String), [fieldName]: null },
                ],
              });
            });
          });
      });
    });

    describe('update', () => {
      describe(mode, () => {
        fieldMatrix
          .filter(({ update }) => !update)
          .forEach(access => {
            test(`field not allowed: ${JSON.stringify(access)}`, async () => {
              const updateMutationName = `update${nameFn[mode](listAccess)}`;
              const item = items[listKey][0];
              const fieldName = getFieldName(access);
              const query = `mutation { ${updateMutationName}(where: { id: "${item.id}" }, data: { ${fieldName}: "bar" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(data).toEqual({ [updateMutationName]: null });
              expectAccessDenied('dev', false, undefined, errors, [{ path: [updateMutationName] }]);
            });
          });
      });
    });
  });
});
