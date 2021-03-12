const { multiAdapterRunners } = require('@keystone-next/test-utils-legacy');
const { arrayToObject } = require('@keystone-next/utils-legacy');
const {
  setupKeystone,
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  listAccessVariations,
  fieldMatrix,
  getFieldName,
} = require('./utils');

const introspectionQuery = `{
  __schema {
    types {
      name
      fields {
        name
      }
      inputFields {
        name
      }
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

const staticList = getStaticListName({ create: true, read: true, update: true, delete: true });
const imperativeList = getImperativeListName({
  create: true,
  read: true,
  update: true,
  delete: true,
});

multiAdapterRunners().map(({ before, after, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    let keystone, queries, mutations, types, fieldTypes, context;
    beforeAll(async () => {
      const _before = await before(setupKeystone);
      keystone = _before.keystone;
      context = _before.context;

      const { data, errors } = await context.exitSudo().executeGraphQL({
        query: introspectionQuery,
      });
      expect(errors).toBe(undefined);
      queries = data.__schema.queryType.fields.map(({ name }) => name);
      mutations = data.__schema.mutationType.fields.map(({ name }) => name);
      types = data.__schema.types.map(({ name }) => name);
      fieldTypes = arrayToObject(data.__schema.types, 'name', type =>
        Object.assign({}, type, {
          fields: arrayToObject(type.fields || [], 'name'),
          inputFields: arrayToObject(type.inputFields || [], 'name'),
        })
      );
    });
    afterAll(async () => {
      await after(keystone);
    });

    describe('static', () => {
      listAccessVariations.forEach(access => {
        test(JSON.stringify(access), async () => {
          const name = getStaticListName(access);
          // The type is used in all the queries and mutations as a return type
          if (access.create || access.read || access.update || access.delete) {
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

      fieldMatrix.forEach(access => {
        test(`${JSON.stringify(access)} on ${staticList}`, () => {
          const name = getFieldName(access);

          expect(fieldTypes[staticList].fields).not.toBe(null);

          const fields = fieldTypes[staticList].fields;
          if (access.read) {
            expect(fields[name]).not.toBe(undefined);
          } else {
            expect(fields[name]).toBe(undefined);
          }

          // Filter types are only used when reading
          expect(fieldTypes[`${staticList}WhereInput`].inputFields).not.toBe(undefined);
          if (access.read) {
            expect(fieldTypes[`${staticList}WhereInput`].inputFields[name]).not.toBe(undefined);
          } else {
            expect(fieldTypes[`${staticList}WhereInput`].inputFields[name]).toBe(undefined);
          }

          // Create inputs
          expect(fieldTypes[`${staticList}CreateInput`].inputFields).not.toBe(undefined);
          if (access.create) {
            expect(fieldTypes[`${staticList}CreateInput`].inputFields[name]).not.toBe(undefined);
          } else {
            expect(fieldTypes[`${staticList}CreateInput`].inputFields[name]).toBe(undefined);
          }

          // Update inputs
          expect(fieldTypes[`${staticList}UpdateInput`].inputFields).not.toBe(undefined);
          if (access.update) {
            expect(fieldTypes[`${staticList}UpdateInput`].inputFields[name]).not.toBe(undefined);
          } else {
            expect(fieldTypes[`${staticList}UpdateInput`].inputFields[name]).toBe(undefined);
          }
        });

        test(`${JSON.stringify(access)} on ${imperativeList}`, () => {
          const name = getFieldName(access);

          expect(fieldTypes[imperativeList].fields).not.toBe(null);

          const fields = fieldTypes[imperativeList].fields;
          expect(fields[name]).not.toBe(undefined);

          // Filter types are only used when reading
          expect(fieldTypes[`${imperativeList}WhereInput`].inputFields).not.toBe(undefined);
          expect(fieldTypes[`${imperativeList}WhereInput`].inputFields[name]).not.toBe(undefined);

          // Create inputs
          expect(fieldTypes[`${imperativeList}CreateInput`].inputFields).not.toBe(undefined);
          expect(fieldTypes[`${imperativeList}CreateInput`].inputFields[name]).not.toBe(undefined);

          // Update inputs
          expect(fieldTypes[`${imperativeList}UpdateInput`].inputFields).not.toBe(undefined);
          expect(fieldTypes[`${imperativeList}UpdateInput`].inputFields[name]).not.toBe(undefined);
        });
      });
    });

    describe('imperative', () => {
      listAccessVariations.forEach(access => {
        test(JSON.stringify(access), async () => {
          const name = getImperativeListName(access);
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
