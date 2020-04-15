const cuid = require('cuid');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystonejs/test-utils');
const { Text } = require('@keystonejs/fields');

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
                foo_starts_with: 'Hello', // arbitrarily restrict the data to a single item (see data.js)
              },
            update: () => () =>
              access.update && {
                foo_starts_with: 'Hello', // arbitrarily restrict the data to a single item (see data.js)
              },
            delete: () => () =>
              access.delete && {
                foo_starts_with: 'Hello', // arbitrarily restrict the data to a single item (see data.js)
              },
            auth: access.auth,
          },
        });
      });
    },
  });
}

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
