import { setupTestEnv, TestEnv } from '@keystone-next/keystone/testing';
import { getGqlNames, KeystoneContext } from '@keystone-next/keystone/types';
import {
  getListName,
  listEnabledVariations,
  fieldMatrix,
  getFieldName,
  config,
} from './schema-utils';

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

const staticList = getListName({ create: true, query: true, update: true, delete: true });

describe(`Schema`, () => {
  let testEnv: TestEnv, context: KeystoneContext;
  let queries: string[],
    mutations: string[],
    types: string[],
    typesByName: Record<string, any>,
    fieldTypes: Record<
      string,
      { name: string; fields: Record<string, any>; inputFields: Record<string, any> }
    >;
  let __schema: {
    types: { name: string; fields: { name: string }[]; inputFields: { name: string }[] }[];
    queryType: { fields: { name: string }[] };
    mutationType: { fields: { name: string }[] };
  };
  beforeAll(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;

    await testEnv.connect();

    const data = await context.graphql.run({ query: introspectionQuery });
    __schema = data.__schema;
    queries = __schema.queryType.fields.map(({ name }) => name);
    mutations = __schema.mutationType.fields.map(({ name }) => name);
    types = __schema.types.map(({ name }) => name);
    typesByName = Object.fromEntries(__schema.types.map(t => [t.name, t]));
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

  describe('isEnabled', () => {
    listEnabledVariations.forEach(isEnabled => {
      test(JSON.stringify(isEnabled === undefined ? 'undefined' : isEnabled), async () => {
        const name = getListName(isEnabled);
        const gqlNames = getGqlNames({ listKey: name, pluralGraphQLName: `${name}s` });
        // The type is used in all the queries and mutations as a return type
        if (isEnabled !== false) {
          expect(types).toContain(gqlNames.outputTypeName);
        } else {
          expect(types).not.toContain(gqlNames.outputTypeName);
        }
        if (
          isEnabled === undefined ||
          isEnabled === true ||
          (isEnabled !== false && (isEnabled.query || isEnabled.update || isEnabled.delete))
        ) {
          // Filter types are also available for update/delete/create (thanks
          // to nested mutations)
          expect(types).toContain(gqlNames.whereUniqueInputName);
        } else {
          expect(types).not.toContain(gqlNames.whereUniqueInputName);
        }

        // The relateTo types do not exist if the list has been completely
        // disabled, or if all four operations have been individually disabled.
        if (
          isEnabled === false ||
          (isEnabled !== undefined &&
            isEnabled !== true &&
            !(isEnabled.query || isEnabled.create || isEnabled.update || isEnabled.delete))
        ) {
          expect(types).not.toContain(gqlNames.relateToManyForCreateInputName);
          expect(types).not.toContain(gqlNames.relateToOneForCreateInputName);
          expect(types).not.toContain(gqlNames.relateToManyForUpdateInputName);
          expect(types).not.toContain(gqlNames.relateToOneForUpdateInputName);
        } else {
          expect(types).toContain(gqlNames.relateToManyForCreateInputName);
          expect(types).toContain(gqlNames.relateToOneForCreateInputName);
          expect(types).toContain(gqlNames.relateToManyForUpdateInputName);
          expect(types).toContain(gqlNames.relateToOneForUpdateInputName);

          const createFromMany = typesByName[
            gqlNames.relateToManyForCreateInputName
          ].inputFields.map(({ name }: { name: string }) => name);
          const createFromOne = typesByName[gqlNames.relateToOneForCreateInputName].inputFields.map(
            ({ name }: { name: string }) => name
          );
          const updateFromMany = typesByName[
            gqlNames.relateToManyForUpdateInputName
          ].inputFields.map(({ name }: { name: string }) => name);
          const updateFromOne = typesByName[gqlNames.relateToOneForUpdateInputName].inputFields.map(
            ({ name }: { name: string }) => name
          );

          expect(createFromMany).not.toContain('unusedPlaceholder');

          if (isEnabled === true || isEnabled === undefined || isEnabled.create) {
            expect(createFromMany).toContain('create');
            expect(createFromOne).toContain('create');
            expect(updateFromMany).toContain('create');
            expect(updateFromOne).toContain('create');
          } else {
            expect(createFromMany).not.toContain('create');
            expect(createFromOne).not.toContain('create');
            expect(updateFromMany).not.toContain('create');
            expect(updateFromOne).not.toContain('create');
          }
          // The connect/disconnect/set operations are supported as long as the uniqueWhere
          // exists, e.g. one of query/update/delete is supported.
          if (
            isEnabled === true ||
            isEnabled === undefined ||
            isEnabled.query ||
            isEnabled.update ||
            isEnabled.delete
          ) {
            expect(createFromMany).toContain('connect');
            expect(createFromOne).toContain('connect');
            expect(updateFromMany).toContain('connect');
            expect(updateFromOne).toContain('connect');
            expect(updateFromMany).toContain('disconnect');
            expect(updateFromOne).toContain('disconnect');
            expect(updateFromMany).toContain('set');
          } else {
            expect(createFromMany).not.toContain('connect');
            expect(createFromOne).not.toContain('connect');
            expect(updateFromMany).not.toContain('connect');
            expect(updateFromOne).not.toContain('connect');
            expect(updateFromMany).not.toContain('disconnect');
            expect(updateFromOne).not.toContain('disconnect');
            expect(updateFromMany).not.toContain('set');
          }
        }

        // Queries are only accessible when reading
        if (
          isEnabled === undefined ||
          isEnabled === true ||
          (isEnabled !== false && isEnabled?.query)
        ) {
          expect(types).toContain(gqlNames.whereInputName);
          expect(queries).toContain(gqlNames.itemQueryName);
          expect(queries).toContain(gqlNames.listQueryName);
          expect(queries).toContain(gqlNames.listQueryCountName);
        } else {
          expect(types).not.toContain(gqlNames.whereInputName);
          expect(queries).not.toContain(gqlNames.itemQueryName);
          expect(queries).not.toContain(gqlNames.listQueryName);
          expect(queries).not.toContain(gqlNames.listQueryCountName);
        }

        if (
          isEnabled === undefined ||
          isEnabled === true ||
          (isEnabled !== false && isEnabled?.create)
        ) {
          expect(mutations).toContain(gqlNames.createMutationName);
        } else {
          expect(mutations).not.toContain(gqlNames.createMutationName);
        }

        if (
          isEnabled === undefined ||
          isEnabled === true ||
          (isEnabled !== false && isEnabled?.update)
        ) {
          expect(mutations).toContain(gqlNames.updateMutationName);
        } else {
          expect(mutations).not.toContain(gqlNames.updateMutationName);
        }

        if (
          isEnabled === undefined ||
          isEnabled === true ||
          (isEnabled !== false && isEnabled?.delete)
        ) {
          expect(mutations).toContain(gqlNames.deleteMutationName);
        } else {
          expect(mutations).not.toContain(gqlNames.deleteMutationName);
        }
      });
    });

    fieldMatrix.forEach(isEnabled => {
      test(`${JSON.stringify(isEnabled)} on ${staticList}`, () => {
        const name = getFieldName(isEnabled);

        expect(fieldTypes[staticList].fields).not.toBe(null);

        const fields = fieldTypes[staticList].fields;
        if (isEnabled.read) {
          expect(fields[name]).not.toBe(undefined);
        } else {
          expect(fields[name]).toBe(undefined);
        }

        // Filters require both `read` and `filter` to be true for
        expect(fieldTypes[`${staticList}WhereInput`].inputFields).not.toBe(undefined);
        if (isEnabled.read && isEnabled.filter) {
          expect(fieldTypes[`${staticList}WhereInput`].inputFields[name]).not.toBe(undefined);
        } else {
          expect(fieldTypes[`${staticList}WhereInput`].inputFields[name]).toBe(undefined);
        }

        // Create inputs
        expect(fieldTypes[`${staticList}CreateInput`].inputFields).not.toBe(undefined);
        if (isEnabled.create) {
          expect(fieldTypes[`${staticList}CreateInput`].inputFields[name]).not.toBe(undefined);
        } else {
          expect(fieldTypes[`${staticList}CreateInput`].inputFields[name]).toBe(undefined);
        }

        // Update inputs
        expect(fieldTypes[`${staticList}UpdateInput`].inputFields).not.toBe(undefined);
        if (isEnabled.update) {
          expect(fieldTypes[`${staticList}UpdateInput`].inputFields[name]).not.toBe(undefined);
        } else {
          expect(fieldTypes[`${staticList}UpdateInput`].inputFields[name]).toBe(undefined);
        }
      });
    });
  });
});
