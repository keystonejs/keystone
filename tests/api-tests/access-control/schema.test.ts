import { setupTestEnv, TestEnv } from '@keystone-next/keystone/testing';
import { getGqlNames, KeystoneContext } from '@keystone-next/types';
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
        const gqlNames = getGqlNames({ listKey: name, pluralGraphQLName: `${name}s` });
        // The type is used in all the queries and mutations as a return type
        if (access.create || access.read || access.update || access.delete) {
          expect(types).toContain(gqlNames.outputTypeName);
          // Filter types are also available for update/delete/create (thanks
          // to nested mutations)
          expect(types).toContain(gqlNames.whereInputName);
          expect(types).toContain(gqlNames.whereUniqueInputName);
        } else {
          expect(types).not.toContain(gqlNames.outputTypeName);
          expect(types).not.toContain(gqlNames.whereInputName);
          expect(types).not.toContain(gqlNames.whereUniqueInputName);
        }

        // Queries are only accessible when reading
        if (access.read) {
          expect(queries).toContain(gqlNames.itemQueryName);
          expect(queries).toContain(gqlNames.listQueryName);
          expect(queries).toContain(gqlNames.listQueryCountName);
        } else {
          expect(queries).not.toContain(gqlNames.itemQueryName);
          expect(queries).not.toContain(gqlNames.listQueryName);
          expect(queries).not.toContain(gqlNames.listQueryCountName);
        }

        if (access.create) {
          expect(mutations).toContain(gqlNames.createMutationName);
        } else {
          expect(mutations).not.toContain(gqlNames.createMutationName);
        }

        if (access.update) {
          expect(mutations).toContain(gqlNames.updateMutationName);
        } else {
          expect(mutations).not.toContain(gqlNames.updateMutationName);
        }

        if (access.delete) {
          expect(mutations).toContain(gqlNames.deleteMutationName);
        } else {
          expect(mutations).not.toContain(gqlNames.deleteMutationName);
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
        const gqlNames = getGqlNames({ listKey: name, pluralGraphQLName: `${name}s` });

        // All types, etc, are included when imperative no matter the config (because
        // it can't be resolved until runtime)
        expect(types).toContain(gqlNames.outputTypeName);
        expect(types).toContain(gqlNames.whereInputName);
        expect(types).toContain(gqlNames.whereUniqueInputName);

        expect(queries).toContain(gqlNames.itemQueryName);
        expect(queries).toContain(gqlNames.listQueryName);
        expect(queries).toContain(gqlNames.listQueryCountName);

        expect(mutations).toContain(gqlNames.createMutationName);
        expect(mutations).toContain(gqlNames.updateMutationName);
        expect(mutations).toContain(gqlNames.deleteMutationName);
      });
    });
  });

  describe('declarative', () => {
    listAccessVariations.forEach(access => {
      test(JSON.stringify(access), async () => {
        const name = getDeclarativeListName(access);

        const gqlNames = getGqlNames({ listKey: name, pluralGraphQLName: `${name}s` });
        // All types, etc, are included when declarative no matter the config (because
        // it can't be resolved until runtime)
        expect(types).toContain(gqlNames.outputTypeName);
        expect(types).toContain(gqlNames.whereInputName);
        expect(types).toContain(gqlNames.whereUniqueInputName);

        expect(queries).toContain(gqlNames.itemQueryName);
        expect(queries).toContain(gqlNames.listQueryName);
        expect(queries).toContain(gqlNames.listQueryCountName);

        if (access.create) {
          expect(mutations).toContain(gqlNames.createMutationName);
        } else {
          expect(mutations).not.toContain(gqlNames.createMutationName);
        }
        expect(mutations).toContain(`update${name}`);
        expect(mutations).toContain(`delete${name}`);
      });
    });
  });
});
