import { GraphQLError, ExecutionResult } from 'graphql';
import { KeystoneContext } from '@keystone-6/core/types';
import { setupTestEnv, TestEnv } from '@keystone-6/api-tests/test-runner';
import { expectAccessDenied, TypeInfoFromConfig } from '../utils';
import {
  nameFn,
  listAccessVariations,
  getOperationListName,
  getItemListName,
  getFilterListName,
  config,
  getFilterBoolListName,
  FAKE_ID,
  FAKE_ID_2,
} from './utils';

const expectNoAccess = (
  data: any,
  errors: readonly GraphQLError[] | undefined,
  name: string,
  msg: string
) => {
  expect(data?.[name]).toBe(null);
  expectAccessDenied(errors, [{ path: [name], msg }]);
};

const expectNoAccessMany = (
  data: any,
  errors: readonly GraphQLError[] | undefined,
  name: string,
  msg: string
) => {
  expect(data?.[name]).toEqual([null]);
  expectAccessDenied(errors, [{ path: [name, 0], msg }]);
};

type IdType = any;

describe(`List access`, () => {
  let testEnv: TestEnv<TypeInfoFromConfig<typeof config>>, context: KeystoneContext;
  let items: Record<string, { id: IdType; name: string }[]>;
  beforeAll(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;

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
      items[listKey] = (await context.sudo().query[listKey].createMany({
        data: _items,
        query: 'id, name',
      })) as { id: IdType; name: string }[];
    }
  });
  afterAll(async () => {
    await testEnv.disconnect();
  });

  describe('create', () => {
    (['operation', 'item'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations.forEach(access => {
          test(`denied: - single - ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const createMutationName = `create${listKey}`;
            const query = `mutation { ${createMutationName}(data: { name: "bar" }) { id } }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;
            if (!access.create) {
              expectNoAccess(data, errors, createMutationName, `You cannot create that ${listKey}`);
            } else {
              expect(errors).toBe(undefined);
              expect(data![createMutationName]).not.toEqual(null);
              await context.sudo().query[listKey].deleteOne({
                where: { id: data![createMutationName].id },
              });
            }
          });
          test(`denied: - many - ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const createMutationName = `create${listKey}s`;
            const query = `mutation { ${createMutationName}(data: [{ name: "bar" }]) { id } }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;
            if (!access.create) {
              expectNoAccessMany(
                data,
                errors,
                createMutationName,
                `You cannot create that ${listKey}`
              );
            } else {
              expect(errors).toBe(undefined);
              expect(data![createMutationName]).not.toEqual(null);
              await context.sudo().query[listKey].deleteOne({
                where: { id: data![createMutationName][0].id },
              });
            }
          });
        });
      });
    });
  });

  describe('query', () => {
    (['operation', 'filter', 'filterBool'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations.forEach(access => {
          test(`single not existing: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const { itemQueryName } = context.gqlNames(listKey);
            const query = `query { ${itemQueryName}(where: { id: "${FAKE_ID}" }) { id } }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;
            expect(errors).toBe(undefined);
            expect(data![itemQueryName]).toBe(null);
          });
          test(`multiple not existing: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const _items = await context.query[listKey].findMany({
              where: { id: { in: [FAKE_ID, FAKE_ID_2] } },
            });
            expect(_items).toHaveLength(0);
          });
        });
      });
    });

    (['operation', 'filterBool'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations.forEach(access => {
          test(`'all' denied: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const allQueryName = context.gqlNames(listKey).listQueryName;
            const query = `query { ${allQueryName} { id } }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;
            expect(errors).toBe(undefined);
            if (!access.query) {
              expect(data![allQueryName]).toHaveLength(0);
            } else {
              expect(data![allQueryName]).toHaveLength(2);
            }
          });

          test(`count denied: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const countName = `${listKey.slice(0, 1).toLowerCase() + listKey.slice(1)}sCount`;
            const query = `query { ${countName} }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;
            expect(errors).toBe(undefined);
            if (!access.query) {
              expect(data![countName]).toEqual(0);
            } else {
              expect(data![countName]).toEqual(2);
            }
          });

          test(`single denied: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const item = await context.sudo().query[listKey].createOne({ data: {} });
            const singleQueryName = context.gqlNames(listKey).itemQueryName;
            const query = `query { ${singleQueryName}(where: { id: "${item.id}" }) { id } }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;
            expect(errors).toBe(undefined);
            if (!access.query) {
              expect(data![singleQueryName]).toBe(null);
            } else {
              expect(data![singleQueryName]).toEqual({ id: item.id });
            }
            await context.sudo().query[listKey].deleteOne({ where: { id: item.id } });
          });
        });
      });
    });
    (['filter'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations.forEach(access => {
          test(`'all' denied: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const allQueryName = context.gqlNames(listKey).listQueryName;
            const query = `query { ${allQueryName} { id } }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;
            expect(errors).toBe(undefined);
            if (!access.query) {
              expect(data![allQueryName]).toHaveLength(0);
            } else {
              expect(data![allQueryName]).toHaveLength(1);
            }
          });

          test(`count denied: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const countName = `${listKey.slice(0, 1).toLowerCase() + listKey.slice(1)}sCount`;
            const query = `query { ${countName} }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;
            expect(errors).toBe(undefined);
            if (!access.query) {
              expect(data![countName]).toEqual(0);
            } else {
              expect(data![countName]).toEqual(1);
            }
          });

          test(`single denied: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const item1 = await context.sudo().query[listKey].createOne({ data: { name: 'foo' } });
            const item2 = await context
              .sudo()
              .query[listKey].createOne({ data: { name: 'Hello' } });
            const singleQueryName = context.gqlNames(listKey).itemQueryName;

            // Run a query where we expect a filter miss
            const query = `query { ${singleQueryName}(where: { id: "${item1.id}" }) { id } }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;
            expect(errors).toBe(undefined);
            if (!access.query) {
              expect(data![singleQueryName]).toBe(null);
            } else {
              // Filtered out
              expect(data![singleQueryName]).toBe(null);
            }
            await context.sudo().query[listKey].deleteOne({ where: { id: item1.id } });

            // Run a query where we expect a filter match
            const _query = `query { ${singleQueryName}(where: { id: "${item2.id}" }) { id } }`;
            const result = (await context.graphql.raw({ query: _query })) as ExecutionResult<any>;
            expect(result.errors).toBe(undefined);
            if (!access.query) {
              expect(result.data![singleQueryName]).toBe(null);
            } else {
              // Filtered in
              expect(result.data![singleQueryName]).toEqual({ id: item2.id });
            }
            await context.sudo().query[listKey].deleteOne({ where: { id: item2.id } });
          });
        });
      });
    });
  });

  describe('update', () => {
    (['operation', 'filter', 'filterBool', 'item'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations.forEach(access => {
          test(`denies missing: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const updateMutationName = `update${listKey}`;
            const query = `mutation { ${updateMutationName}(where: { id: "${FAKE_ID}" }, data: { name: "bar" }) { id } }`;
            const { data, errors } = await context.graphql.raw({ query });
            expectNoAccess(
              data,
              errors,
              updateMutationName,
              `You cannot update that ${listKey} - it may not exist`
            );
          });
        });
      });
    });
    (['operation', 'filterBool', 'item'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations.forEach(access => {
          test(`denies: - single - ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const item = await context.sudo().query[listKey].createOne({ data: {} });
            const updateMutationName = `update${listKey}`;
            const query = `mutation { ${updateMutationName}(where: { id: "${item.id}" }, data: { name: "bar" }) { id name } }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;
            if (!access.update) {
              expectNoAccess(
                data,
                errors,
                updateMutationName,
                `You cannot update that ${listKey} - it may not exist`
              );
            } else {
              expect(errors).toBe(undefined);
              expect(data![updateMutationName]).toEqual({ id: item.id, name: 'bar' });
            }

            await context.sudo().query[listKey].deleteOne({ where: { id: item.id } });
          });
          test(`denies: - many - ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const item = await context.sudo().query[listKey].createOne({ data: {} });
            const updateMutationName = `update${listKey}s`;
            const query = `mutation { ${updateMutationName}(data: [{ where: { id: "${item.id}" }, data: { name: "bar" } }]) { id name } }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;
            if (!access.update) {
              expectNoAccessMany(
                data,
                errors,
                updateMutationName,
                `You cannot update that ${listKey} - it may not exist`
              );
            } else {
              expect(errors).toBe(undefined);
              expect(data![updateMutationName]).toEqual([{ id: item.id, name: 'bar' }]);
            }
            await context.sudo().query[listKey].deleteOne({ where: { id: item.id } });
          });
        });
      });
    });
    (['filter'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations.forEach(access => {
          test(`denies: - single - ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const item1 = await context.sudo().query[listKey].createOne({ data: { name: 'foo' } });
            const item2 = await context
              .sudo()
              .query[listKey].createOne({ data: { name: 'Hello' } });

            const updateMutationName = `update${listKey}`;

            const query = `mutation { ${updateMutationName}(where: { id: "${item1.id}" }, data: { name: "bar" }) { id } }`;
            const { data, errors } = await context.graphql.raw({ query });
            expectNoAccess(
              data,
              errors,
              updateMutationName,
              `You cannot update that ${listKey} - it may not exist`
            );
            await context.sudo().query[listKey].deleteOne({ where: { id: item1.id } });

            const _query = `mutation { ${updateMutationName}(where: { id: "${item2.id}" }, data: { name: "bar" }) { id } }`;
            const result = (await context.graphql.raw({ query: _query })) as ExecutionResult<any>;
            if (!access.update) {
              expectNoAccess(
                result.data,
                result.errors,
                updateMutationName,
                `You cannot update that ${listKey} - it may not exist`
              );
            } else {
              // Filtered in
              expect(result.errors).toBe(undefined);
              expect(result.data![updateMutationName]).not.toEqual(null);
            }
            await context.sudo().query[listKey].deleteOne({ where: { id: item2.id } });
          });

          test(`denies: - many - ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const item1 = await context.sudo().query[listKey].createOne({ data: { name: 'foo' } });
            const item2 = await context
              .sudo()
              .query[listKey].createOne({ data: { name: 'Hello' } });

            const updateMutationName = `update${listKey}s`;
            const query = `mutation { ${updateMutationName}(data: [{ where: { id: "${item1.id}" }, data: { name: "bar" } }]) { id } }`;
            const { data, errors } = await context.graphql.raw({ query });
            expectNoAccessMany(
              data,
              errors,
              updateMutationName,
              `You cannot update that ${listKey} - it may not exist`
            );
            await context.sudo().query[listKey].deleteOne({ where: { id: item1.id } });

            const _query = `mutation { ${updateMutationName}(data: [{ where: { id: "${item2.id}" }, data: { name: "bar" } }]) { id } }`;
            const result = (await context.graphql.raw({ query: _query })) as ExecutionResult<any>;
            if (!access.update) {
              expectNoAccessMany(
                result.data,
                result.errors,
                updateMutationName,
                `You cannot update that ${listKey} - it may not exist`
              );
            } else {
              // Filtered in
              expect(result.errors).toBe(undefined);
              expect(result.data![updateMutationName][0]).not.toEqual(null);
            }
            await context.sudo().query[listKey].deleteOne({ where: { id: item2.id } });
          });
        });
      });
    });
  });

  describe('delete', () => {
    (['operation', 'filter', 'filterBool', 'item'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations.forEach(access => {
          test(`single denies missing: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const deleteMutationName = `delete${listKey}`;
            const query = `mutation { ${deleteMutationName}(where: { id: "${FAKE_ID}" }) { id } }`;
            const { data, errors } = await context.graphql.raw({ query });
            expectNoAccess(
              data,
              errors,
              deleteMutationName,
              `You cannot delete that ${listKey} - it may not exist`
            );
          });

          test(`multi denies missing: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const multiDeleteMutationName = `delete${listKey}s`;
            const query = `mutation { ${multiDeleteMutationName}(where: [{ id: "${FAKE_ID}" }, { id: "${FAKE_ID_2}" }]) { id } }`;
            const { data, errors } = await context.graphql.raw({ query });
            if (access.delete || mode === 'item') {
              expectAccessDenied(errors, [
                {
                  path: [multiDeleteMutationName, 0],
                  msg: `You cannot delete that ${listKey} - it may not exist`,
                },
                {
                  path: [multiDeleteMutationName, 1],
                  msg: `You cannot delete that ${listKey} - it may not exist`,
                },
              ]);
            } else {
              expectAccessDenied(errors, [
                {
                  path: [multiDeleteMutationName, 0],
                  msg: `You cannot delete that ${listKey} - it may not exist`,
                },
                {
                  path: [multiDeleteMutationName, 1],
                  msg: `You cannot delete that ${listKey} - it may not exist`,
                },
              ]);
            }
            expect(data).toEqual({ [multiDeleteMutationName]: [null, null] });
          });
        });
      });
    });

    (['operation', 'filterBool', 'item'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations.forEach(access => {
          test(`single denied: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const item = await context.sudo().query[listKey].createOne({ data: {} });

            const deleteMutationName = `delete${listKey}`;
            const query = `mutation { ${deleteMutationName}(where: {id: "${item.id}" }) { id } }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;

            if (!access.delete) {
              expectNoAccess(
                data,
                errors,
                deleteMutationName,
                `You cannot delete that ${listKey} - it may not exist`
              );
            } else {
              expect(errors).toBe(undefined);
              expect(data![deleteMutationName]).not.toEqual(null);
            }
            if (!access.delete) {
              await context.sudo().query[listKey].deleteOne({ where: { id: item.id } });
            }
          });

          test(`multi denied: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const item = await context.sudo().query[listKey].createOne({ data: {} });

            const multiDeleteMutationName = `delete${listKey}s`;
            const query = `mutation { ${multiDeleteMutationName}(where: [{ id: "${item.id}" }]) { id } }`;
            const { data, errors } = (await context.graphql.raw({ query })) as ExecutionResult<any>;

            if (!access.delete) {
              expectNoAccessMany(
                data,
                errors,
                multiDeleteMutationName,
                `You cannot delete that ${listKey} - it may not exist`
              );
            } else {
              expect(errors).toBe(undefined);
              expect(data![multiDeleteMutationName]).not.toEqual(null);
            }

            if (!access.delete) {
              await context.sudo().query[listKey].deleteOne({ where: { id: item.id } });
            }
          });
        });
      });
    });
    (['filter'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations.forEach(access => {
          test(`single denied: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const item1 = await context.sudo().query[listKey].createOne({ data: { name: 'foo' } });
            const item2 = await context
              .sudo()
              .query[listKey].createOne({ data: { name: 'Hello' } });

            const deleteMutationName = `delete${listKey}`;
            const query = `mutation { ${deleteMutationName}(where: {id: "${item1.id}" }) { id } }`;
            const { data, errors } = await context.graphql.raw({ query });
            expectNoAccess(
              data,
              errors,
              deleteMutationName,
              `You cannot delete that ${listKey} - it may not exist`
            );

            if (!access.delete) {
              await context.sudo().query[listKey].deleteOne({ where: { id: item1.id } });
            }

            const _query = `mutation { ${deleteMutationName}(where: {id: "${item2.id}" }) { id } }`;
            const result = (await context.graphql.raw({ query: _query })) as ExecutionResult<any>;
            if (!access.delete) {
              expectNoAccess(
                result.data,
                result.errors,
                deleteMutationName,
                `You cannot delete that ${listKey} - it may not exist`
              );
            } else {
              // Filtered in
              expect(result.errors).toBe(undefined);
              expect(result.data![deleteMutationName]).not.toEqual(null);
            }

            if (!access.delete) {
              await context.sudo().query[listKey].deleteOne({ where: { id: item2.id } });
            }
          });

          test(`multi denied: ${JSON.stringify(access)}`, async () => {
            const listKey = nameFn[mode](access);
            const item1 = await context.sudo().query[listKey].createOne({ data: { name: 'foo' } });
            const item2 = await context
              .sudo()
              .query[listKey].createOne({ data: { name: 'Hello' } });

            const multiDeleteMutationName = `delete${listKey}s`;
            const query = `mutation { ${multiDeleteMutationName}(where: [{ id: "${item1.id}" }]) { id } }`;
            const { data, errors } = await context.graphql.raw({ query });
            expectNoAccessMany(
              data,
              errors,
              multiDeleteMutationName,
              `You cannot delete that ${listKey} - it may not exist`
            );
            if (!access.delete) {
              await context.sudo().query[listKey].deleteOne({ where: { id: item1.id } });
            }

            const _query = `mutation { ${multiDeleteMutationName}(where: [{ id: "${item2.id}" }]) { id } }`;
            const result = (await context.graphql.raw({ query: _query })) as ExecutionResult<any>;
            if (!access.delete) {
              expectNoAccessMany(
                result.data,
                result.errors,
                multiDeleteMutationName,
                `You cannot delete that ${listKey} - it may not exist`
              );
            } else {
              // Filtered in
              expect(result.errors).toBe(undefined);
              expect(result.data![multiDeleteMutationName]).not.toEqual(null);
            }
            if (!access.delete) {
              await context.sudo().query[listKey].deleteOne({ where: { id: item2.id } });
            }
          });
        });
      });
    });
  });
});
