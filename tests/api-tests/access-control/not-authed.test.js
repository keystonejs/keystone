const { multiAdapterRunners } = require('@keystonejs/test-utils');
const { FAKE_ID, nameFn, listAccessVariations, setupKeystone } = require('./utils');

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
                const query = `mutation { ${createMutationName}(data: { name: "bar" }) { id } }`;
                const { data, errors } = await keystone.executeGraphQL({ query });
                expectNoAccess(data, errors, createMutationName);
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
