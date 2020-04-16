const { multiAdapterRunners, graphqlRequest } = require('@keystonejs/test-utils');
const {
  setupKeystone,
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  listAccessVariations,
} = require('./utils');

const introspectionQuery = `{
  __schema {
    types {
      name
    }
    queryType {
      fields {
        name
      }
    }
    mutationType {
      fields {
        name
      }
    }
  }
}`;

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

    describe('static', () => {
      listAccessVariations.forEach(access => {
        test(JSON.stringify(access), async () => {
          const name = getStaticListName(access);
          const { data, errors } = await graphqlRequest({
            keystone,
            query: introspectionQuery,
          });
          expect(errors).toBe(undefined);
          const queries = data.__schema.queryType.fields.map(({ name }) => name);
          const mutations = data.__schema.mutationType.fields.map(({ name }) => name);
          const types = data.__schema.types.map(({ name }) => name);

          // The type is used in all the queries and mutations as a return type
          if (access.create || access.read || access.update || access.delete || access.auth) {
            expect(types).toContain(`${name}`);
            // Filter types are also available for update/delete/create (thanks
            // to nested mutations)
            expect(types).toContain(`${name}WhereInput`);
            expect(types).toContain(`${name}WhereUniqueInput`);
          } else {
            expect(types).not.toContain(`${name}`);
            expect(types).not.toContain(`${name}WhereInput`);
            expect(types).not.toContain(`${name}WhereUniqueInput`);
          }

          // Queries are only accessible when reading
          if (access.read) {
            expect(queries).toContain(`${name}`);
            expect(queries).toContain(`all${name}s`);
            expect(queries).toContain(`_all${name}sMeta`);
          } else {
            expect(queries).not.toContain(`${name}`);
            expect(queries).not.toContain(`all${name}s`);
            expect(queries).not.toContain(`_all${name}sMeta`);
          }

          if (access.create) {
            expect(mutations).toContain(`create${name}`);
          } else {
            expect(mutations).not.toContain(`create${name}`);
          }

          if (access.update) {
            expect(mutations).toContain(`update${name}`);
          } else {
            expect(mutations).not.toContain(`update${name}`);
          }

          if (access.delete) {
            expect(mutations).toContain(`delete${name}`);
          } else {
            expect(mutations).not.toContain(`delete${name}`);
          }
        });
      });
    });

    describe('imperative', () => {
      listAccessVariations.forEach(access => {
        test(JSON.stringify(access), async () => {
          const name = getImperativeListName(access);
          const { data, errors } = await graphqlRequest({
            keystone,
            query: introspectionQuery,
          });
          expect(errors).toBe(undefined);
          const queries = data.__schema.queryType.fields.map(({ name }) => name);
          const mutations = data.__schema.mutationType.fields.map(({ name }) => name);
          const types = data.__schema.types.map(({ name }) => name);

          // All types, etc, are included when imperative no matter the config (because
          // it can't be resolved until runtime)
          expect(types).toContain(`${name}`);
          expect(types).toContain(`${name}WhereInput`);
          expect(types).toContain(`${name}WhereUniqueInput`);

          expect(queries).toContain(`${name}`);
          expect(queries).toContain(`all${name}s`);
          expect(queries).toContain(`_all${name}sMeta`);

          expect(mutations).toContain(`create${name}`);
          expect(mutations).toContain(`update${name}`);
          expect(mutations).toContain(`delete${name}`);
        });
      });
    });

    describe('declarative', () => {
      listAccessVariations.forEach(access => {
        test(JSON.stringify(access), async () => {
          const name = getDeclarativeListName(access);
          const { data, errors } = await graphqlRequest({
            keystone,
            query: introspectionQuery,
          });
          expect(errors).toBe(undefined);
          const queries = data.__schema.queryType.fields.map(({ name }) => name);
          const mutations = data.__schema.mutationType.fields.map(({ name }) => name);
          const types = data.__schema.types.map(({ name }) => name);

          // All types, etc, are included when declarative no matter the config (because
          // it can't be resolved until runtime)
          expect(types).toContain(`${name}`);
          expect(types).toContain(`${name}WhereInput`);
          expect(types).toContain(`${name}WhereUniqueInput`);

          expect(queries).toContain(`${name}`);
          expect(queries).toContain(`all${name}s`);
          expect(queries).toContain(`_all${name}sMeta`);

          if (access.create) {
            expect(mutations).toContain(`create${name}`);
          } else {
            expect(mutations).not.toContain(`create${name}`);
          }
          expect(mutations).toContain(`update${name}`);
          expect(mutations).toContain(`delete${name}`);
        });
      });
    });
  })
);
