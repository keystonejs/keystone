const cuid = require('cuid');
const {
  multiAdapterRunners,
  setupServer,
  authedGraphqlRequest,
} = require('@keystonejs/test-utils');
const { Text } = require('@keystonejs/fields');

const FAKE_ID = '5b3eabd9e9f2e3e4866742ea';

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
    let keystone;
    beforeAll(async () => {
      const _before = await before(setupKeystone);
      keystone = _before.keystone;
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
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${createMutationName}(data: { name: "bar" }) { id } }`,
                  authentication: {},
                });
                expect(data[createMutationName]).toBe(null);
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual('You do not have access to this resource');
                expect(error.path).toHaveLength(1);
                expect(error.path[0]).toEqual(createMutationName);
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
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `query { ${allQueryName} { id } }`,
                  authentication: {},
                });
                expect(data[allQueryName]).toBe(null);
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual('You do not have access to this resource');
                expect(error.path).toHaveLength(1);
                expect(error.path[0]).toEqual(allQueryName);
              });

              test(`meta denied: ${JSON.stringify(access)}`, async () => {
                const metaName = `_all${nameFn[mode](access)}sMeta`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `query { ${metaName} { count } }`,
                  authentication: {},
                });
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
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `query { ${singleQueryName}(where: { id: "abc123" }) { id } }`,
                  authentication: {},
                });
                expect(data[singleQueryName]).toBe(null);
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual('You do not have access to this resource');
                expect(error.path).toHaveLength(1);
                expect(error.path[0]).toEqual(singleQueryName);
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
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${updateMutationName}(id: "${FAKE_ID}", data: { name: "bar" }) { id } }`,
                  authentication: {},
                });
                expect(data[updateMutationName]).toBe(null);
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual('You do not have access to this resource');
                expect(error.path).toHaveLength(1);
                expect(error.path[0]).toEqual(updateMutationName);
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
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${deleteMutationName}(id: "${FAKE_ID}") { id } }`,
                  authentication: {},
                });
                expect(data[deleteMutationName]).toBe(null);
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual('You do not have access to this resource');
                expect(error.path).toHaveLength(1);
                expect(error.path[0]).toEqual(deleteMutationName);
              });

              test(`multi denied: ${JSON.stringify(access)}`, async () => {
                const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
                const { data, errors } = await authedGraphqlRequest({
                  keystone,
                  query: `mutation { ${multiDeleteMutationName}(ids: ["${FAKE_ID}"]) { id } }`,
                  authentication: {},
                });
                expect(data[multiDeleteMutationName]).toBe(null);
                expect(errors).toHaveLength(1);
                const error = errors[0];
                expect(error.message).toEqual('You do not have access to this resource');
                expect(error.path).toHaveLength(1);
                expect(error.path[0]).toEqual(multiDeleteMutationName);
              });
            });
        });
      });
    });
  })
);
