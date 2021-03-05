const { multiAdapterRunners } = require('@keystone-next/test-utils-legacy');
const {
  deleteItem,
  createItems,
  updateItem,
} = require('@keystone-next/server-side-graphql-client-legacy');
const {
  FAKE_ID,
  nameFn,
  listAccessVariations,
  fieldMatrix,
  setupKeystone,
  getFieldName,
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
} = require('./utils');

const expectNoAccess = (data, errors, name) => {
  expect(data[name]).toBe(null);
  expect(errors).toHaveLength(1);
  const error = errors[0];
  expect(error.message).toEqual('You do not have access to this resource');
  expect(error.path).toHaveLength(1);
  expect(error.path[0]).toEqual(name);
};

multiAdapterRunners().map(({ before, after, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    let keystone, items;
    beforeAll(async () => {
      const _before = await before(setupKeystone);
      keystone = _before.keystone;

      // ensure every list has at least some data
      const initialData = listAccessVariations.reduce(
        (acc, access) =>
          Object.assign(acc, {
            [getStaticListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
            [getImperativeListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
            [getDeclarativeListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
          }),
        {}
      );

      items = {};
      const context = keystone.createContext({ schemaName: 'internal' });
      for (const [listKey, _items] of Object.entries(initialData)) {
        items[listKey] = await createItems({
          keystone,
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
      ['imperative'].forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ create }) => !create)
            .forEach(access => {
              test(`denied: ${JSON.stringify(access)}`, async () => {
                const createMutationName = `create${nameFn[mode](access)}`;
                const query = `mutation { ${createMutationName}(data: { name: "bar" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNoAccess(data, errors, createMutationName);
              });
            });
        });
      });

      ['static'].forEach(mode => {
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
                  auth: false,
                };
                const createMutationName = `create${nameFn[mode](listAccess)}`;
                const fieldName = getFieldName(access);
                const query = `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id ${fieldName} } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                // If create is not allowed on a field then there's no error, it's just set to null
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).not.toBe(null);
                expect(data[createMutationName].id).not.toBe(null);
                if (access.read) {
                  expect(data[createMutationName][fieldName]).toBe(null);
                } else {
                  expect(data[createMutationName][fieldName]).toBe(undefined);
                }
                await deleteItem({
                  keystone,
                  listKey: nameFn[mode](listAccess),
                  itemId: data[createMutationName].id,
                });
              });
            });
        });
      });
      ['imperative'].forEach(mode => {
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
                  auth: false,
                };
                const createMutationName = `create${nameFn[mode](listAccess)}`;
                const fieldName = getFieldName(access);
                const query = `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(data[createMutationName]).toEqual(null);
                expect(errors).not.toBe(undefined);
                expect(errors).toHaveLength(1);
                expect(errors[0].name).toEqual('GraphQLError');
                expect(errors[0].message).toEqual('You do not have access to this resource');
                expect(errors[0].path).toEqual([createMutationName]);
              });
            });
        });
      });
    });

    describe('read', () => {
      ['imperative', 'declarative'].forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ read }) => !read)
            .forEach(access => {
              test(`'all' denied: ${JSON.stringify(access)}`, async () => {
                const allQueryName = `all${nameFn[mode](access)}s`;
                const query = `query { ${allQueryName} { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNoAccess(data, errors, allQueryName);
              });

              test(`meta denied: ${JSON.stringify(access)}`, async () => {
                const metaName = `_all${nameFn[mode](access)}sMeta`;
                const query = `query { ${metaName} { count } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(data[metaName].count).toBe(null);
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual('You do not have access to this resource');
                expect(error.path).toHaveLength(2);
                expect(error.path[0]).toEqual(metaName);
                expect(error.path[1]).toEqual('count');
              });

              test(`single denied: ${JSON.stringify(access)}`, async () => {
                const singleQueryName = nameFn[mode](access);
                const query = `query { ${singleQueryName}(where: { id: "abc123" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNoAccess(data, errors, singleQueryName);
              });
            });
        });
      });
      ['imperative'].forEach(mode => {
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
                  auth: false,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const singleQueryName = listKey;
                await updateItem({
                  context: keystone.createContext({ schemaName: 'internal' }),
                  listKey,
                  item: { id: item.id, data: { [fieldName]: 'hello' } },
                });
                const query = `query { ${singleQueryName}(where: { id: "${item.id}" }) { id ${fieldName} } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).not.toBe(null);
                expect(errors).toHaveLength(1);
                expect(errors[0].name).toEqual('GraphQLError');
                expect(errors[0].message).toEqual('You do not have access to this resource');
                expect(errors[0].path).toEqual([singleQueryName, fieldName]);
                expect(data[singleQueryName]).not.toBe(null);
                expect(data[singleQueryName].id).not.toBe(null);
                expect(data[singleQueryName][fieldName]).toBe(null);
              });
              test(`field allowed - multi: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                  auth: false,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const allQueryName = `all${listKey}s`;
                await updateItem({
                  context: keystone.createContext({ schemaName: 'internal' }),
                  listKey,
                  item: { id: item.id, data: { [fieldName]: 'hello' } },
                });
                const query = `query { ${allQueryName} { id ${fieldName} } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).not.toBe(null);
                expect(errors).toHaveLength(2);
                expect(errors[0].name).toEqual('GraphQLError');
                expect(errors[0].message).toEqual('You do not have access to this resource');
                expect(errors[0].path).toEqual([allQueryName, 0, fieldName]);
                expect(errors[1].name).toEqual('GraphQLError');
                expect(errors[1].message).toEqual('You do not have access to this resource');
                expect(errors[1].path).toEqual([allQueryName, 1, fieldName]);
                expect(data[allQueryName]).not.toBe(null);
                expect(data[allQueryName]).toHaveLength(2);
                for (const _item of data[allQueryName]) {
                  expect(_item.id).not.toBe(null);
                  expect(_item[fieldName]).toEqual(null);
                }
              });
            });
        });
      });
      ['static'].forEach(mode => {
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
                  auth: false,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const singleQueryName = listKey;
                await updateItem({
                  context: keystone.createContext({ schemaName: 'internal' }),
                  listKey,
                  item: { id: item.id, data: { [fieldName]: 'hello' } },
                });
                const query = `query { ${singleQueryName}(where: { id: "${item.id}" }) { id ${fieldName} } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toEqual(undefined);
                expect(data[singleQueryName]).not.toBe(null);
                expect(data[singleQueryName].id).not.toBe(null);
                expect(data[singleQueryName][fieldName]).toBe(undefined);
              });
              test(`field allowed - multi: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                  auth: false,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const allQueryName = `all${listKey}s`;
                await updateItem({
                  context: keystone.createContext({ schemaName: 'internal' }),
                  listKey,
                  item: { id: item.id, data: { [fieldName]: 'hello' } },
                });
                const query = `query { ${allQueryName} { id ${fieldName} } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toBe(undefined);
                expect(data[allQueryName]).not.toBe(null);
                expect(data[allQueryName]).toHaveLength(2);
                for (const _item of data[allQueryName]) {
                  expect(_item.id).not.toBe(null);
                  expect(_item[fieldName]).toEqual(undefined);
                }
              });
            });
        });
      });
    });

    describe('update', () => {
      ['imperative', 'declarative'].forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ update }) => !update)
            .forEach(access => {
              test(`denies: ${JSON.stringify(access)}`, async () => {
                const updateMutationName = `update${nameFn[mode](access)}`;
                const query = `mutation { ${updateMutationName}(id: "${FAKE_ID}", data: { name: "bar" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNoAccess(data, errors, updateMutationName);
              });
            });
        });
      });

      ['static'].forEach(mode => {
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
                  auth: false,
                };
                const updateMutationName = `update${nameFn[mode](listAccess)}`;
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const query = `mutation { ${updateMutationName}(id: "${item.id}", data: { ${fieldName}: "bar" }) { id ${fieldName} } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                // If update is not allowed on a field then there's no error, it's just set to null
                expect(errors).toBe(undefined);
                expect(data[updateMutationName]).not.toBe(null);
                expect(data[updateMutationName].id).not.toBe(null);
                if (access.read) {
                  expect(data[updateMutationName][fieldName]).toBe(null);
                } else {
                  expect(data[updateMutationName][fieldName]).toBe(undefined);
                }
              });
            });
        });
      });
      ['imperative'].forEach(mode => {
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
                  auth: false,
                };
                const updateMutationName = `update${nameFn[mode](listAccess)}`;
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const fieldName = getFieldName(access);
                const query = `mutation { ${updateMutationName}(id: "${item.id}", data: { ${fieldName}: "bar" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(data[updateMutationName]).toEqual(null);
                expect(errors).not.toBe(undefined);
                expect(errors).toHaveLength(1);
                expect(errors[0].name).toEqual('GraphQLError');
                expect(errors[0].message).toEqual('You do not have access to this resource');
                expect(errors[0].path).toEqual([updateMutationName]);
              });
            });
        });
      });
    });

    describe('delete', () => {
      ['imperative', 'declarative'].forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(access => !access.delete)
            .forEach(access => {
              test(`single denied: ${JSON.stringify(access)}`, async () => {
                const deleteMutationName = `delete${nameFn[mode](access)}`;
                const query = `mutation { ${deleteMutationName}(id: "${FAKE_ID}") { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNoAccess(data, errors, deleteMutationName);
              });

              test(`multi denied: ${JSON.stringify(access)}`, async () => {
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const query = `mutation { ${multiDeleteMutationName}(ids: ["${FAKE_ID}"]) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNoAccess(data, errors, multiDeleteMutationName);
              });
            });
        });
      });
    });
  })
);
