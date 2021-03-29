import { GraphQLError } from 'graphql';
import { multiAdapterRunners } from '@keystone-next/test-utils-legacy';
// @ts-ignore
import { createItems, updateItem } from '@keystone-next/server-side-graphql-client-legacy';
import { KeystoneContext } from '@keystone-next/types';
import {
  FAKE_ID,
  nameFn,
  listAccessVariations,
  fieldMatrix,
  setupKeystone,
  getFieldName,
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
} from './utils';

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

type IdType = any;

multiAdapterRunners().map(({ before, after, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    let keystone: any,
      items: Record<string, { id: IdType; name: string }[]>,
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
        items[listKey] = await createItems({
          listKey,
          items: _items.map(x => ({ data: x })),
          returnFields: 'id, name',
          context,
        });
      }
    });
    afterAll(async () => {
      await after(keystone);
    });

    describe('create', () => {
      (['imperative'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ create }) => !create)
            .forEach(access => {
              test(`denied: ${JSON.stringify(access)}`, async () => {
                const createMutationName = `create${nameFn[mode](access)}`;
                const query = `mutation { ${createMutationName}(data: { name: "bar" }) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expectNoAccess(data, errors, createMutationName);
              });
            });
        });
      });

      (['static'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ create }) => !create)
            .forEach(access => {
              test(`field not allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                };
                const createMutationName = `create${nameFn[mode](listAccess)}`;
                const fieldName = getFieldName(access);
                const query = `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id ${fieldName} } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                // If create is not allowed on a field then there will be a query validation error
                expect(errors).toHaveLength(access.read ? 1 : 2);
                expect(errors![0].message).toContain(
                  `Field "${fieldName}" is not defined by type "${nameFn[mode](
                    listAccess
                  )}CreateInput".`
                );
                if (!access.read) {
                  expect(errors![1].message).toContain(
                    `Cannot query field "${fieldName}" on type "${nameFn[mode](listAccess)}".`
                  );
                }
                expect(data).toBe(undefined);
              });
            });
        });
      });
      (['imperative'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ create }) => !create)
            .forEach(access => {
              test(`field not allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                };
                const createMutationName = `create${nameFn[mode](listAccess)}`;
                const fieldName = getFieldName(access);
                const query = `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expect(data?.[createMutationName]).toEqual(null);
                expect(errors).not.toBe(undefined);
                expect(errors).toHaveLength(1);
                expect(errors![0].name).toEqual('GraphQLError');
                expect(errors![0].message).toEqual('You do not have access to this resource');
                expect(errors![0].path).toEqual([createMutationName]);
              });
            });
        });
      });
    });

    describe('read', () => {
      (['imperative', 'declarative'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ read }) => !read)
            .forEach(access => {
              test(`'all' denied: ${JSON.stringify(access)}`, async () => {
                const allQueryName = `all${nameFn[mode](access)}s`;
                const query = `query { ${allQueryName} { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expectNoAccess(data, errors, allQueryName);
              });

              test(`meta denied: ${JSON.stringify(access)}`, async () => {
                const metaName = `_all${nameFn[mode](access)}sMeta`;
                const query = `query { ${metaName} { count } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expect(data?.[metaName].count).toBe(null);
                expect(errors).toHaveLength(1);
                const error = errors![0];
                expect(error.message).toEqual('You do not have access to this resource');
                expect(error.path).toHaveLength(2);
                expect(error.path![0]).toEqual(metaName);
                expect(error.path![1]).toEqual('count');
              });

              test(`single denied: ${JSON.stringify(access)}`, async () => {
                const singleQueryName = nameFn[mode](access);
                const query = `query { ${singleQueryName}(where: { id: "abc123" }) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expectNoAccess(data, errors, singleQueryName);
              });
            });
        });
      });
      (['imperative'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ read }) => !read)
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
                const singleQueryName = listKey;
                await updateItem({
                  context,
                  listKey,
                  item: { id: item.id, data: { [fieldName]: 'hello' } },
                });
                const query = `query { ${singleQueryName}(where: { id: "${item.id}" }) { id ${fieldName} } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expect(errors).not.toBe(null);
                expect(errors).toHaveLength(1);
                expect(errors![0].name).toEqual('GraphQLError');
                expect(errors![0].message).toEqual('You do not have access to this resource');
                expect(errors![0].path).toEqual([singleQueryName, fieldName]);
                expect(data?.[singleQueryName]).not.toBe(null);
                expect(data?.[singleQueryName].id).not.toBe(null);
                expect(data?.[singleQueryName][fieldName]).toBe(null);
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
                const allQueryName = `all${listKey}s`;
                await updateItem({
                  context,
                  listKey,
                  item: { id: item.id, data: { [fieldName]: 'hello' } },
                });
                const query = `query { ${allQueryName} { id ${fieldName} } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expect(errors).not.toBe(null);
                expect(errors).toHaveLength(2);
                expect(errors![0].name).toEqual('GraphQLError');
                expect(errors![0].message).toEqual('You do not have access to this resource');
                expect(errors![0].path).toEqual([allQueryName, 0, fieldName]);
                expect(errors![1].name).toEqual('GraphQLError');
                expect(errors![1].message).toEqual('You do not have access to this resource');
                expect(errors![1].path).toEqual([allQueryName, 1, fieldName]);
                expect(data?.[allQueryName]).not.toBe(null);
                expect(data?.[allQueryName]).toHaveLength(2);
                for (const _item of data?.[allQueryName]) {
                  expect(_item.id).not.toBe(null);
                  expect(_item[fieldName]).toEqual(null);
                }
              });
            });
        });
      });
      (['static'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ read }) => !read)
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
                const singleQueryName = listKey;
                await updateItem({
                  context,
                  listKey,
                  item: { id: item.id, data: { [fieldName]: 'hello' } },
                });
                const query = `query { ${singleQueryName}(where: { id: "${item.id}" }) { id ${fieldName} } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expect(errors).toHaveLength(1);
                expect(errors![0].message).toContain(
                  `Cannot query field "${fieldName}" on type "${listKey}".`
                );
                expect(data).toBe(undefined);
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
                const allQueryName = `all${listKey}s`;
                await updateItem({
                  context,
                  listKey,
                  item: { id: item.id, data: { [fieldName]: 'hello' } },
                });
                const query = `query { ${allQueryName} { id ${fieldName} } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expect(errors).toHaveLength(1);
                expect(errors![0].message).toContain(
                  `Cannot query field "${fieldName}" on type "${listKey}".`
                );
                expect(data).toBe(undefined);
              });
            });
        });
      });
    });

    describe('update', () => {
      (['imperative', 'declarative'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ update }) => !update)
            .forEach(access => {
              test(`denies: ${JSON.stringify(access)}`, async () => {
                const updateMutationName = `update${nameFn[mode](access)}`;
                const query = `mutation { ${updateMutationName}(id: "${FAKE_ID}", data: { name: "bar" }) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expectNoAccess(data, errors, updateMutationName);
              });
            });
        });
      });

      (['static'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ update }) => !update)
            .forEach(access => {
              test(`field not allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                };
                const updateMutationName = `update${nameFn[mode](listAccess)}`;
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const query = `mutation { ${updateMutationName}(id: "${
                  item.id
                }", data: { ${fieldName}: "bar" }) { id ${access.read ? fieldName : ''} } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                // If update is not allowed on a field then there will be a query validation error
                expect(errors).toHaveLength(1);
                expect(errors![0].message).toContain(
                  `Field "${fieldName}" is not defined by type "${listKey}UpdateInput".`
                );
                expect(data).toBe(undefined);
              });
            });
        });
      });
      (['imperative'] as const).forEach(mode => {
        describe(mode, () => {
          fieldMatrix
            .filter(({ update }) => !update)
            .forEach(access => {
              test(`field not allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                };
                const updateMutationName = `update${nameFn[mode](listAccess)}`;
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const query = `mutation { ${updateMutationName}(id: "${item.id}", data: { ${fieldName}: "bar" }) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expect(data?.[updateMutationName]).toEqual(null);
                expect(errors).not.toBe(undefined);
                expect(errors).toHaveLength(1);
                expect(errors![0].name).toEqual('GraphQLError');
                expect(errors![0].message).toEqual('You do not have access to this resource');
                expect(errors![0].path).toEqual([updateMutationName]);
              });
            });
        });
      });
    });

    describe('delete', () => {
      (['imperative', 'declarative'] as const).forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(access => !access.delete)
            .forEach(access => {
              test(`single denied: ${JSON.stringify(access)}`, async () => {
                const deleteMutationName = `delete${nameFn[mode](access)}`;
                const query = `mutation { ${deleteMutationName}(id: "${FAKE_ID}") { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expectNoAccess(data, errors, deleteMutationName);
              });

              test(`multi denied: ${JSON.stringify(access)}`, async () => {
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const query = `mutation { ${multiDeleteMutationName}(ids: ["${FAKE_ID}"]) { id } }`;
                const { data, errors } = await context.exitSudo().graphql.raw({ query });
                expectNoAccess(data, errors, multiDeleteMutationName);
              });
            });
        });
      });
    });
  })
);
