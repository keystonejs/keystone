const { multiAdapterRunners } = require('@keystonejs/test-utils');
const {
  createItem,
  createItems,
  deleteItem,
  updateItem,
} = require('@keystonejs/server-side-graphql-client');
const {
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
} = require('./utils');
const expectNoAccess = (data, errors, name) => {
  expect(data[name]).toBe(null);
  expect(errors).toHaveLength(1);
  const error = errors[0];
  expect(error.message).toEqual('You do not have access to this resource');
  expect(error.path).toHaveLength(1);
  expect(error.path[0]).toEqual(name);
};

const expectNamedArray = (data, errors, name, values) => {
  expect(errors).toBe(undefined);
  expect(data[name]).toHaveLength(values.length);
  const sortedData = data[name].map(({ id }) => id).sort();
  values.sort().forEach((value, i) => {
    expect(sortedData[i]).toEqual(value);
  });
};

multiAdapterRunners().map(({ before, after, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    let keystone, items, user;
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
      user = await createItem({
        listKey: 'User',
        item: { name: 'test', yesRead: 'yes', noRead: 'no' },
        returnFields: 'id name yesRead noRead',
        context,
      });
    });
    afterAll(async () => {
      await after(keystone);
    });

    describe('create', () => {
      ['imperative'].forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ create }) => create)
            .forEach(access => {
              test(`allowed: ${JSON.stringify(access)}`, async () => {
                const createMutationName = `create${nameFn[mode](access)}`;
                const query = `mutation { ${createMutationName}(data: { name: "bar" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).not.toBe(null);
                expect(data[createMutationName].id).not.toBe(null);
                await deleteItem({
                  keystone,
                  listKey: nameFn[mode](access),
                  itemId: data[createMutationName].id,
                });
              });
            });
        });
      });
      ['static'].forEach(mode => {
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
                  auth: false,
                };
                const createMutationName = `create${nameFn[mode](listAccess)}`;
                const fieldName = getFieldName(access);
                const query = `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id ${fieldName} } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).not.toBe(null);
                expect(data[createMutationName].id).not.toBe(null);
                if (access.read) {
                  expect(data[createMutationName][fieldName]).toBe('bar');
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
            .filter(({ create }) => create)
            .forEach(access => {
              test(`field allowed: ${JSON.stringify(access)}`, async () => {
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
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).not.toBe(null);
                expect(data[createMutationName].id).not.toBe(null);
                await deleteItem({
                  keystone,
                  listKey: nameFn[mode](listAccess),
                  itemId: data[createMutationName].id,
                });
              });
            });
        });
      });
    });

    describe('read', () => {
      test('authed user', async () => {
        const query = `query { authenticatedUser { id yesRead noRead } }`;
        const context = keystone.createContext({ authentication: { item: user, listKey: 'User' } });
        const { data, errors } = await keystone.executeGraphQL({ context, query });
        expect(data.authenticatedUser).not.toBe(null);
        expect(data.authenticatedUser.id).toEqual(user.id);
        expect(data.authenticatedUser.yesRead).toEqual(user.yesRead);
        expect(data.authenticatedUser.noRead).toEqual(null);
        expect(errors).toHaveLength(1);
        expect(errors[0].name).toEqual('GraphQLError');
        expect(errors[0].message).toEqual('You do not have access to this resource');
        expect(errors[0].path).toEqual(['authenticatedUser', 'noRead']);
      });

      ['imperative', 'declarative'].forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ read }) => read)
            .forEach(access => {
              test(`'all' allowed: ${JSON.stringify(access)}`, async () => {
                const allQueryName = `all${nameFn[mode](access)}s`;
                const query = `query { ${allQueryName} { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toBe(undefined);
                if (mode === 'imperative') {
                  expect(data[allQueryName]).toHaveLength(2);
                } else {
                  expect(data[allQueryName]).toHaveLength(1); // We can only read the ones our permission filter allow
                }
              });

              test(`meta allowed: ${JSON.stringify(access)}`, async () => {
                const metaName = `_all${nameFn[mode](access)}sMeta`;
                const query = `query { ${metaName} { count } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toBe(undefined);
                if (mode === 'imperative') {
                  expect(data[metaName].count).toEqual(2);
                } else {
                  expect(data[metaName].count).toEqual(1); // We can only read the ones our permission filter allow
                }
              });

              test(`single allowed: ${JSON.stringify(access)}`, async () => {
                const singleQueryName = nameFn[mode](access);
                const validId = items[singleQueryName].find(({ name }) => name === 'Hello').id;
                const query = `query { ${singleQueryName}(where: { id: "${validId}" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toBe(undefined);
                expect(data[singleQueryName]).not.toBe(null);
                expect(data[singleQueryName].id).toEqual(validId);
              });

              test(`single not allowed: ${JSON.stringify(access)}`, async () => {
                const singleQueryName = nameFn[mode](access);
                const invalidId = items[singleQueryName].find(({ name }) => name !== 'Hello').id;
                const query = `query { ${singleQueryName}(where: { id: "${invalidId}" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                if (mode === 'imperative') {
                  // Imperative should work
                  expect(errors).toBe(undefined);
                  expect(data[singleQueryName]).not.toBe(null);
                  expect(data[singleQueryName].id).toEqual(invalidId);
                } else {
                  // but declarative should not
                  expectNoAccess(data, errors, singleQueryName);
                }
              });

              test(`single not existing: ${JSON.stringify(access)}`, async () => {
                const singleQueryName = nameFn[mode](access);
                const query = `query { ${singleQueryName}(where: { id: "${FAKE_ID[adapterName]}" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNoAccess(data, errors, singleQueryName);
              });

              test(`multiple not existing: ${JSON.stringify(access)}`, async () => {
                const allQueryName = `all${nameFn[mode](access)}s`;
                const query = `query { ${allQueryName}(where: { id_in: ["${FAKE_ID[adapterName]}", "${FAKE_ID_2[adapterName]}"] }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toBe(undefined);
                expect(data[allQueryName]).toHaveLength(0);
              });
            });
        });
      });
      ['imperative', 'static'].forEach(mode => {
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
                expect(errors).toBe(undefined);
                expect(data[singleQueryName]).not.toBe(null);
                expect(data[singleQueryName].id).not.toBe(null);
                expect(data[singleQueryName][fieldName]).toBe('hello');
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
      ['imperative', 'declarative'].forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ update }) => update)
            .forEach(access => {
              test(`denies missing: ${JSON.stringify(access)}`, async () => {
                const updateMutationName = `update${nameFn[mode](access)}`;
                const query = `mutation { ${updateMutationName}(id: "${FAKE_ID[adapterName]}", data: { name: "bar" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNoAccess(data, errors, updateMutationName);
              });

              test(`denies by declarative: ${JSON.stringify(access)}`, async () => {
                const updateMutationName = `update${nameFn[mode](access)}`;
                const singleQueryName = nameFn[mode](access);
                const invalidId = items[singleQueryName].find(({ name }) => name !== 'Hello').id;
                const query = `mutation { ${updateMutationName}(id: "${invalidId}", data: { name: "bar" }) { id name } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                if (mode === 'imperative') {
                  expect(errors).toBe(undefined);
                  expect(data[updateMutationName]).not.toBe(null);
                  expect(data[updateMutationName].id).toEqual(invalidId);
                  expect(data[updateMutationName].name).toEqual('bar');
                  // Reset data
                  await keystone.executeGraphQL({
                    query: `mutation { ${updateMutationName}(id: "${invalidId}", data: { name: "Hello" }) { id name } }`,
                  });
                } else {
                  expectNoAccess(data, errors, updateMutationName);
                }
              });

              test(`allows: ${JSON.stringify(access)}`, async () => {
                const updateMutationName = `update${nameFn[mode](access)}`;
                const singleQueryName = nameFn[mode](access);
                const validId = items[singleQueryName].find(({ name }) => name === 'Hello').id;
                const query = `mutation { ${updateMutationName}(id: "${validId}", data: { name: "bar" }) { id name } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toBe(undefined);
                expect(data[updateMutationName]).not.toBe(null);
                expect(data[updateMutationName].id).toEqual(validId);
                expect(data[updateMutationName].name).toEqual('bar');
                // Reset data
                await keystone.executeGraphQL({
                  query: `mutation { ${updateMutationName}(id: "${validId}", data: { name: "Hello" }) { id name } }`,
                });
              });
            });
        });
      });
      ['static'].forEach(mode => {
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
                  auth: false,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const updateMutationName = `update${listKey}`;
                const fieldName = getFieldName(access);
                const query = `mutation { ${updateMutationName}(id: "${item.id}", data: { ${fieldName}: "bar" }) { id ${fieldName} } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toBe(undefined);
                expect(data[updateMutationName]).not.toBe(null);
                expect(data[updateMutationName].id).not.toBe(null);
                if (access.read) {
                  expect(data[updateMutationName][fieldName]).toBe('bar');
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
            .filter(({ update }) => update)
            .forEach(access => {
              test(`field allowed: ${JSON.stringify(access)}`, async () => {
                const listAccess = {
                  create: true,
                  read: true,
                  update: true,
                  delete: true,
                  auth: false,
                };
                const listKey = nameFn[mode](listAccess);
                const item = items[listKey][0];
                const updateMutationName = `update${listKey}`;
                const fieldName = getFieldName(access);
                const query = `mutation { ${updateMutationName}(id: "${item.id}", data: { ${fieldName}: "bar" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toBe(undefined);
                expect(data[updateMutationName]).not.toBe(null);
                expect(data[updateMutationName].id).not.toBe(null);
              });
            });
        });
      });
    });

    describe('delete', () => {
      [('imperative', 'declarative')].forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(access => access.delete)
            .forEach(access => {
              const create = async item =>
                createItem({
                  keystone,
                  listKey: nameFn[mode](access),
                  item,
                  context: keystone.createContext({ schemaName: 'internal' }),
                });
              test(`single allowed: ${JSON.stringify(access)}`, async () => {
                const { id: validId } = await create({ name: 'Hello' });
                const deleteMutationName = `delete${nameFn[mode](access)}`;
                const query = `mutation { ${deleteMutationName}(id: "${validId}") { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expect(errors).toBe(undefined);
                expect(data[deleteMutationName]).not.toBe(null);
                expect(data[deleteMutationName].id).toEqual(validId);
              });

              test(`single denies: ${JSON.stringify(access)}`, async () => {
                const { id: invalidId } = await create({ name: 'hi' });
                const deleteMutationName = `delete${nameFn[mode](access)}`;
                const query = `mutation { ${deleteMutationName}(id: "${invalidId}") { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                if (mode === 'imperative') {
                  expect(errors).toBe(undefined);
                  expect(data[deleteMutationName]).not.toBe(null);
                  expect(data[deleteMutationName].id).toEqual(invalidId);
                } else {
                  expectNoAccess(data, errors, deleteMutationName);
                }
              });

              test(`single denies missing: ${JSON.stringify(access)}`, async () => {
                const deleteMutationName = `delete${nameFn[mode](access)}`;
                const query = `mutation { ${deleteMutationName}(id: "${FAKE_ID[adapterName]}") { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNoAccess(data, errors, deleteMutationName);
              });

              test(`multi allowed: ${JSON.stringify(access)}`, async () => {
                const { id: validId1 } = await create({ name: 'Hello' });
                const { id: validId2 } = await create({ name: 'Hello' });
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const query = `mutation { ${multiDeleteMutationName}(ids: ["${validId1}", "${validId2}"]) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNamedArray(data, errors, multiDeleteMutationName, [validId1, validId2]);
              });

              test(`multi denies: ${JSON.stringify(access)}`, async () => {
                const { id: validId1 } = await create({ name: 'hi' });
                const { id: validId2 } = await create({ name: 'hi' });
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const query = `mutation { ${multiDeleteMutationName}(ids: ["${validId1}", "${validId2}"]) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
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
                const { data, errors } = await keystone.executeGraphQL({ query });
                if (mode === 'imperative') {
                  expectNamedArray(data, errors, multiDeleteMutationName, [validId1, validId2]);
                } else {
                  expectNamedArray(data, errors, multiDeleteMutationName, [validId1]);
                }
              });

              test(`multi denies missing: ${JSON.stringify(access)}`, async () => {
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const query = `mutation { ${multiDeleteMutationName}(ids: ["${FAKE_ID[adapterName]}", "${FAKE_ID_2[adapterName]}"]) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNamedArray(data, errors, multiDeleteMutationName, []);
              });
            });
        });
      });
    });
  })
);
