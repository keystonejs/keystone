const cuid = require('cuid');
const {
  multiAdapterRunners,
  setupServer,
  authedGraphqlRequest,
} = require('@keystonejs/test-utils');
const { Text } = require('@keystonejs/fields');

const FAKE_ID = { mongoose: '5b3eabd9e9f2e3e4866742ea', knex: 137 };
const FAKE_ID_2 = { mongoose: '5b3eabd9e9f2e3e4866742eb', knex: 138 };

const yesNo = truthy => (truthy ? 'Yes' : 'No');

const getPrefix = access => {
  // prettier-ignore
  let prefix = `${yesNo(access.create)}Create${yesNo(access.read)}Read${yesNo(access.update)}Update${yesNo(access.auth)}Auth`;
  if (Object.prototype.hasOwnProperty.call(access, 'delete')) {
    prefix = `${prefix}${yesNo(access.delete)}Delete`;
  }
  return prefix;
};

const getStaticListName = access => `${getPrefix(access)}StaticList`;
const getImperativeListName = access => `${getPrefix(access)}ImperativeList`;
const getDeclarativeListName = access => `${getPrefix(access)}DeclarativeList`;

/* Generated with:
  const result = [];
  const options = ['create', 'read', 'update', 'delete', 'auth'];
  // All possible combinations are contained in the set 0..2^n-1
  for(let flags = 0; flags < Math.pow(2, options.length); flags++) {
    // Generate an object of true/false values for the particular combination
    result.push(options.reduce((memo, option, index) => ({
      ...memo,
      // Use a bit mask to see if that bit is set
      [option]: !!(flags & (1 << index)),
    }), {}));
  }
  */
const listAccessVariations = [
  { create: false, read: false, update: false, delete: false, auth: true },
  { create: true, read: false, update: false, delete: false, auth: true },
  { create: false, read: true, update: false, delete: false, auth: true },
  { create: true, read: true, update: false, delete: false, auth: true },
  { create: false, read: false, update: true, delete: false, auth: true },
  { create: true, read: false, update: true, delete: false, auth: true },
  { create: false, read: true, update: true, delete: false, auth: true },
  { create: true, read: true, update: true, delete: false, auth: true },
  { create: false, read: false, update: false, delete: true, auth: true },
  { create: true, read: false, update: false, delete: true, auth: true },
  { create: false, read: true, update: false, delete: true, auth: true },
  { create: true, read: true, update: false, delete: true, auth: true },
  { create: false, read: false, update: true, delete: true, auth: true },
  { create: true, read: false, update: true, delete: true, auth: true },
  { create: false, read: true, update: true, delete: true, auth: true },
  { create: true, read: true, update: true, delete: true, auth: true },
  { create: false, read: false, update: false, delete: false, auth: false },
  { create: true, read: false, update: false, delete: false, auth: false },
  { create: false, read: true, update: false, delete: false, auth: false },
  { create: true, read: true, update: false, delete: false, auth: false },
  { create: false, read: false, update: true, delete: false, auth: false },
  { create: true, read: false, update: true, delete: false, auth: false },
  { create: false, read: true, update: true, delete: false, auth: false },
  { create: true, read: true, update: true, delete: false, auth: false },
  { create: false, read: false, update: false, delete: true, auth: false },
  { create: true, read: false, update: false, delete: true, auth: false },
  { create: false, read: true, update: false, delete: true, auth: false },
  { create: true, read: true, update: false, delete: true, auth: false },
  { create: false, read: false, update: true, delete: true, auth: false },
  { create: true, read: false, update: true, delete: true, auth: false },
  { create: false, read: true, update: true, delete: true, auth: false },
  { create: true, read: true, update: true, delete: true, auth: false },
];

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('User', { fields: { name: { type: Text } } });

      listAccessVariations.forEach(access => {
        keystone.createList(getStaticListName(access), {
          fields: { name: { type: Text } },
          access,
        });
        keystone.createList(getImperativeListName(access), {
          fields: { name: { type: Text } },
          access: {
            create: () => access.create,
            read: () => access.read,
            update: () => access.update,
            delete: () => access.delete,
            auth: () => access.auth,
          },
        });
        keystone.createList(getDeclarativeListName(access), {
          fields: { name: { type: Text } },
          access: {
            create: access.create,
            read: () =>
              access.read && {
                name_starts_with: 'Hello', // arbitrarily restrict the data to a single item (see data.js)
              },
            update: () =>
              access.update && {
                name_starts_with: 'Hello', // arbitrarily restrict the data to a single item (see data.js)
              },
            delete: () =>
              access.delete && {
                name_starts_with: 'Hello', // arbitrarily restrict the data to a single item (see data.js)
              },
            auth: access.auth,
          },
        });
      });
    },
  });
}

const nameFn = { imperative: getImperativeListName, declarative: getDeclarativeListName };

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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                    authentication: {},
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
                  authentication: {},
                });
                expect(errors).toBe(undefined);
                expect(data[updateMutationName]).not.toBe(null);
                expect(data[updateMutationName].id).toEqual(validId);
                expect(data[updateMutationName].name).toEqual('bar');
                // Reset data
                await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${updateMutationName}(id: "${validId}", data: { name: "Hello" }) { id name } }`,
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
                  authentication: {},
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
