const { multiAdapterRunners, authedGraphqlRequest } = require('@keystonejs/test-utils');
const { FAKE_ID, nameFn, listAccessVariations, setupKeystone } = require('./utils');

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
