const { multiAdapterRunners, authedGraphqlRequest } = require('@keystonejs/test-utils');
const {
  FAKE_ID,
  FAKE_ID_2,
  getStaticListName,
  listAccessVariations,
  getImperativeListName,
  getDeclarativeListName,
  nameFn,
  setupKeystone
} = require('./utils');

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
      items = await keystone.createItems(initialData);
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
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${createMutationName}(data: { name: "bar" }) { id } }`,
                });
                expect(errors).toBe(undefined);
                expect(data[createMutationName]).not.toBe(null);
                expect(data[createMutationName].id).not.toBe(null);
                const _delete = (list, id) => keystone.getListByKey(list).adapter.delete(id);
                await _delete(nameFn[mode](access), data[createMutationName].id);
              });
            });
        });
      });
    });

    describe('read', () => {
      ['imperative', 'declarative'].forEach(mode => {
        describe(mode, () => {
          listAccessVariations
            .filter(({ read }) => read)
            .forEach(access => {
              test(`'all' allowed: ${JSON.stringify(access)}`, async () => {
                const allQueryName = `all${nameFn[mode](access)}s`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `query { ${allQueryName} { id } }`,
                });
                expect(errors).toBe(undefined);
                if (mode === 'imperative') {
                  expect(data[allQueryName]).toHaveLength(2);
                } else {
                  expect(data[allQueryName]).toHaveLength(1); // We can only read the ones our permission filter allow
                }
              });

              test(`meta allowed: ${JSON.stringify(access)}`, async () => {
                const metaName = `_all${nameFn[mode](access)}sMeta`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `query { ${metaName} { count } }`,
                });
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
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `query { ${singleQueryName}(where: { id: "${validId}" }) { id } }`,
                });
                expect(errors).toBe(undefined);
                expect(data[singleQueryName]).not.toBe(null);
                expect(data[singleQueryName].id).toEqual(validId);
              });

              test(`single not allowed: ${JSON.stringify(access)}`, async () => {
                const singleQueryName = nameFn[mode](access);
                const invalidId = items[singleQueryName].find(({ name }) => name !== 'Hello').id;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `query { ${singleQueryName}(where: { id: "${invalidId}" }) { id } }`,
                });
                if (mode === 'imperative') {
                  // Imperative should work
                  expect(errors).toBe(undefined);
                  expect(data[singleQueryName]).not.toBe(null);
                  expect(data[singleQueryName].id).toEqual(invalidId);
                } else {
                  // but declarative should not
                  expect(data[singleQueryName]).toBe(null);
                  expect(errors).toHaveLength(1);
                  const error = errors[0];
                  expect(error.message).toEqual('You do not have access to this resource');
                  expect(error.path).toHaveLength(1);
                  expect(error.path[0]).toEqual(singleQueryName);
                }
              });

              test(`single not existing: ${JSON.stringify(access)}`, async () => {
                const singleQueryName = nameFn[mode](access);
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `query { ${singleQueryName}(where: { id: "${FAKE_ID[adapterName]}" }) { id } }`,
                });
                expect(data[singleQueryName]).toBe(null);
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual('You do not have access to this resource');
                expect(error.path).toHaveLength(1);
                expect(error.path[0]).toEqual(singleQueryName);
              });

              test(`multiple not existing: ${JSON.stringify(access)}`, async () => {
                const allQueryName = `all${nameFn[mode](access)}s`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `query { ${allQueryName}(where: { id_in: ["${FAKE_ID[adapterName]}", "${FAKE_ID_2[adapterName]}"] }) { id } }`,
                });
                expect(errors).toBe(undefined);
                expect(data[allQueryName]).toHaveLength(0);
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
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${updateMutationName}(id: "${FAKE_ID[adapterName]}", data: { name: "bar" }) { id } }`,
                });
                expect(data[updateMutationName]).toBe(null);
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual('You do not have access to this resource');
                expect(error.path).toHaveLength(1);
                expect(error.path[0]).toEqual(updateMutationName);
              });

              test(`denies by declarative: ${JSON.stringify(access)}`, async () => {
                const updateMutationName = `update${nameFn[mode](access)}`;
                const singleQueryName = nameFn[mode](access);
                const invalidId = items[singleQueryName].find(({ name }) => name !== 'Hello').id;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${updateMutationName}(id: "${invalidId}", data: { name: "bar" }) { id name } }`,
                });
                if (mode === 'imperative') {
                  expect(errors).toBe(undefined);
                  expect(data[updateMutationName]).not.toBe(null);
                  expect(data[updateMutationName].id).toEqual(invalidId);
                  expect(data[updateMutationName].name).toEqual('bar');
                  // Reset data
                  await authedGraphqlRequest({
                    keystone,
                    query: `mutation { ${updateMutationName}(id: "${invalidId}", data: { name: "Hello" }) { id name } }`,
                  });
                } else {
                  expect(data[updateMutationName]).toBe(null);
                  expect(errors).toHaveLength(1);
                  const error = errors[0];
                  expect(error.message).toEqual('You do not have access to this resource');
                  expect(error.path).toHaveLength(1);
                  expect(error.path[0]).toEqual(updateMutationName);
                }
              });

              test(`allows: ${JSON.stringify(access)}`, async () => {
                const updateMutationName = `update${nameFn[mode](access)}`;
                const singleQueryName = nameFn[mode](access);
                const validId = items[singleQueryName].find(({ name }) => name === 'Hello').id;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${updateMutationName}(id: "${validId}", data: { name: "bar" }) { id name } }`,
                });
                expect(errors).toBe(undefined);
                expect(data[updateMutationName]).not.toBe(null);
                expect(data[updateMutationName].id).toEqual(validId);
                expect(data[updateMutationName].name).toEqual('bar');
                // Reset data
                await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${updateMutationName}(id: "${validId}", data: { name: "Hello" }) { id name } }`,
                });
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
              test(`single allowed: ${JSON.stringify(access)}`, async () => {
                const create = (list, item) => keystone.getListByKey(list).adapter.create(item);
                const { id: validId } = await create(nameFn[mode](access), { name: 'Hello' });
                const deleteMutationName = `delete${nameFn[mode](access)}`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${deleteMutationName}(id: "${validId}") { id } }`,
                });
                expect(errors).toBe(undefined);
                expect(data[deleteMutationName]).not.toBe(null);
                expect(data[deleteMutationName].id).toEqual(validId);
              });

              test(`single denies: ${JSON.stringify(access)}`, async () => {
                const create = (list, item) => keystone.getListByKey(list).adapter.create(item);
                const { id: invalidId } = await create(nameFn[mode](access), { name: 'hi' });
                const deleteMutationName = `delete${nameFn[mode](access)}`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${deleteMutationName}(id: "${invalidId}") { id } }`,
                });
                if (mode === 'imperative') {
                  expect(errors).toBe(undefined);
                  expect(data[deleteMutationName]).not.toBe(null);
                  expect(data[deleteMutationName].id).toEqual(invalidId);
                } else {
                  expect(data[deleteMutationName]).toBe(null);
                  expect(errors).toHaveLength(1);
                  const error = errors[0];
                  expect(error.message).toEqual('You do not have access to this resource');
                  expect(error.path).toHaveLength(1);
                  expect(error.path[0]).toEqual(deleteMutationName);
                }
              });

              test(`single denies missing: ${JSON.stringify(access)}`, async () => {
                const deleteMutationName = `delete${nameFn[mode](access)}`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${deleteMutationName}(id: "${FAKE_ID[adapterName]}") { id } }`,
                });
                expect(data[deleteMutationName]).toBe(null);
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual('You do not have access to this resource');
                expect(error.path).toHaveLength(1);
                expect(error.path[0]).toEqual(deleteMutationName);
              });

              test(`multi allowed: ${JSON.stringify(access)}`, async () => {
                const create = (list, item) => keystone.getListByKey(list).adapter.create(item);
                const { id: validId1 } = await create(nameFn[mode](access), { name: 'Hello' });
                const { id: validId2 } = await create(nameFn[mode](access), { name: 'Hello' });
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${multiDeleteMutationName}(ids: ["${validId1}", "${validId2}"]) { id } }`,
                });
                expect(errors).toBe(undefined);
                expect(data[multiDeleteMutationName]).toHaveLength(2);
                expect(data[multiDeleteMutationName][0].id).toEqual(validId1);
                expect(data[multiDeleteMutationName][1].id).toEqual(validId2);
              });

              test(`multi denies: ${JSON.stringify(access)}`, async () => {
                const create = (list, item) => keystone.getListByKey(list).adapter.create(item);
                const { id: validId1 } = await create(nameFn[mode](access), { name: 'hi' });
                const { id: validId2 } = await create(nameFn[mode](access), { name: 'hi' });
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${multiDeleteMutationName}(ids: ["${validId1}", "${validId2}"]) { id } }`,
                });

                expect(errors).toBe(undefined);
                if (mode === 'imperative') {
                  expect(data[multiDeleteMutationName]).toHaveLength(2);
                  expect(data[multiDeleteMutationName][0].id).toEqual(validId1);
                  expect(data[multiDeleteMutationName][1].id).toEqual(validId2);
                } else {
                  expect(data[multiDeleteMutationName]).toHaveLength(0);
                }
              });

              test(`multi mixed allows/denies: ${JSON.stringify(access)}`, async () => {
                const create = (list, item) => keystone.getListByKey(list).adapter.create(item);
                const { id: validId1 } = await create(nameFn[mode](access), { name: 'Hello' });
                const { id: validId2 } = await create(nameFn[mode](access), { name: 'hi' });
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${multiDeleteMutationName}(ids: ["${validId1}", "${validId2}"]) { id } }`,
                });
                expect(errors).toBe(undefined);
                if (mode === 'imperative') {
                  expect(data[multiDeleteMutationName]).toHaveLength(2);
                  expect(data[multiDeleteMutationName][0].id).toEqual(validId1);
                  expect(data[multiDeleteMutationName][1].id).toEqual(validId2);
                } else {
                  expect(data[multiDeleteMutationName]).toHaveLength(1);
                  expect(data[multiDeleteMutationName][0].id).toEqual(validId1);
                }
              });

              test(`multi denies missing: ${JSON.stringify(access)}`, async () => {
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${multiDeleteMutationName}(ids: ["${FAKE_ID[adapterName]}", "${FAKE_ID_2[adapterName]}"]) { id } }`,
                });
                expect(errors).toBe(undefined);
                expect(data[multiDeleteMutationName]).toHaveLength(0);
              });
            });
        });
      });
    });
  })
);
