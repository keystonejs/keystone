import { setupTestEnv, TestEnv } from '@keystone-next/testing';
import { KeystoneContext } from '@keystone-next/types';
import {
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  listAccessVariations,
  fieldMatrix,
  getFieldName,
  config,
} from './utils';

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

describe(`Schema`, () => {
  let testEnv: TestEnv, context: KeystoneContext;
  let queries: string[],
    mutations: string[],
    types: string[],
    fieldTypes: Record<
      string,
      { name: string; fields: Record<string, any>; inputFields: Record<string, any> }
    >;
  beforeAll(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;

    await testEnv.connect();

    const data = await context.graphql.run({ query: introspectionQuery });
    const __schema: {
      types: { name: string; fields: { name: string }[]; inputFields: { name: string }[] }[];
      queryType: { fields: { name: string }[] };
      mutationType: { fields: { name: string }[] };
    } = data.__schema;
    queries = __schema.queryType.fields.map(({ name }) => name);
    mutations = __schema.mutationType.fields.map(({ name }) => name);
    types = __schema.types.map(({ name }) => name);
    fieldTypes = Object.fromEntries(
      __schema.types.map(type => [
        type.name,
        {
          name: type.name,
          fields: Object.fromEntries((type.fields || []).map(x => [x.name, x])),
          inputFields: Object.fromEntries((type.inputFields || []).map(x => [x.name, x])),
        },
      ])
    );
  });
  afterAll(async () => {
    await testEnv.disconnect();
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
          expect(queries).not.toContain(`${name.slice(0, 1).toLowerCase() + name.slice(1)}Count`);
        } else {
          expect(queries).not.toContain(`${name}`);
          expect(queries).not.toContain(`all${name}s`);
          expect(queries).not.toContain(`${name.slice(0, 1).toLowerCase() + name.slice(1)}Count`);
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
        expect(queries).not.toContain(`${name.slice(0, 1).toLowerCase() + name.slice(1)}Count`);

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
        expect(queries).not.toContain(`${name.slice(0, 1).toLowerCase() + name.slice(1)}Count`);

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
});
