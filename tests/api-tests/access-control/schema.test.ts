import { createSystem, initConfig } from '@keystone-6/core/system';
import { getGqlNames } from '@keystone-6/core/types';
import { ExecutionResult } from 'graphql';
import { relationship, text } from '@keystone-6/core/fields';
import { list, ListSchemaConfig } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { allowAll } from '@keystone-6/core/access';
import { apiTestConfig } from '../utils';

const COOKIE_SECRET = 'qwertyuiopasdfghjlkzxcvbmnm1234567890';

const yesNo = (x: boolean | undefined) => (x === true ? 'Y' : x === false ? 'N' : 'U');

type ListConfig = {
  isFilterable?: false;
  isOrderable?: false;
  omit?:
    | true
    | {
        query?: boolean;
        create?: boolean;
        update?: boolean;
        delete?: boolean;
      };
};

type FieldConfig = {
  isFilterable?: false;
  isOrderable?: false;
  omit?:
    | true
    | {
        read: boolean;
        create: boolean;
        update: boolean;
      };
};

const getListPrefix = ({ isFilterable, isOrderable, omit }: ListConfig) => {
  const s = `${yesNo(isFilterable)}F${yesNo(isOrderable)}O`;
  if (omit === undefined) {
    return `${s}Undefined`;
  } else if (omit === true) {
    return `${s}True`;
  } else {
    // prettier-ignore
    return `${s}${yesNo(omit.create)}C${yesNo(omit.query)}Q${yesNo(omit.update)}U${yesNo(omit.delete)}D`;
  }
};
const getFieldPrefix = ({ isFilterable, isOrderable, omit }: FieldConfig) => {
  const s = `${yesNo(isFilterable)}Filter${yesNo(isOrderable)}Order`;
  if (omit === undefined) {
    return `${s}Undefined`;
  } else if (omit === true) {
    return `${s}True`;
  } else {
    // prettier-ignore
    return `${s}${yesNo(omit.read)}Read${yesNo(omit.create)}Create${yesNo(omit.update)}Update`;
  }
};

const getListName = (config: ListConfig) => `${getListPrefix(config)}List`;
const getFieldName = (config: FieldConfig) => getFieldPrefix(config);

const listConfigVariables: ListConfig[] = [];
for (const isFilterable of [undefined, false as const]) {
  for (const isOrderable of [undefined, false as const]) {
    for (const flag of [undefined, true, false]) {
      if (flag === undefined || flag === true) {
        listConfigVariables.push({ isFilterable, isOrderable, omit: flag });
      } else {
        for (const query of [undefined, 'query']) {
          for (const create of [undefined, 'create']) {
            for (const update of [undefined, 'update']) {
              for (const _delete of [undefined, 'delete']) {
                const omit = [query, create, update, _delete].filter(x => x) as ListConfig['omit'];
                listConfigVariables.push({ isFilterable, isOrderable, omit });
              }
            }
          }
        }
      }
    }
  }
}

const fieldMatrix: FieldConfig[] = [];
for (const isFilterable of [undefined, false as const]) {
  for (const isOrderable of [undefined, false as const]) {
    for (const flag of [undefined, true, false]) {
      if (flag === undefined || flag === true) {
        fieldMatrix.push({ isFilterable, isOrderable, omit: flag });
      } else {
        for (const read of [false, true]) {
          for (const create of [false, true]) {
            for (const update of [false, true]) {
              fieldMatrix.push({
                isFilterable,
                isOrderable,
                omit: {
                  read,
                  create,
                  update,
                },
              });
            }
          }
        }
      }
    }
  }
}

const createFieldStatic = (config: FieldConfig) => ({
  [getFieldName(config)]: text({
    graphql: { omit: config.omit },
    isFilterable: config.isFilterable,
    isOrderable: config.isOrderable,
  }),
});

const createRelatedFields = (config: ListConfig) => ({
  [`${getListPrefix(config)}one`]: relationship({ ref: getListName(config), many: false }),
  [`${getListPrefix(config)}many`]: relationship({ ref: getListName(config), many: true }),
});

const lists: ListSchemaConfig = {};

listConfigVariables.forEach(config => {
  lists[getListName(config)] = list({
    access: allowAll,
    fields: Object.assign(
      { name: text() },
      ...fieldMatrix.map(variation => createFieldStatic(variation))
    ),
    defaultIsFilterable: config.isFilterable,
    defaultIsOrderable: config.isOrderable,
    graphql: { omit: config.omit },
  });
});

lists.RelatedToAll = list({
  access: allowAll,
  fields: Object.assign({}, ...listConfigVariables.map(config => createRelatedFields(config))),
});

const config = apiTestConfig({
  lists,
  session: statelessSessions({ secret: COOKIE_SECRET }),
  ui: {
    isAccessAllowed: () => true,
  },
});

export { getListName, listConfigVariables, fieldMatrix, getFieldName, config };

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

class FakePrismaClient {
  $on() {}
  async findMany() {
    return [{ id: 'blah' }];
  }
}

const { getKeystone } = createSystem(initConfig(config));

const { context } = getKeystone({ PrismaClient: FakePrismaClient, Prisma: {} as any });

describe(`Public schema`, () => {
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
    const data = (await context.graphql.run({ query: introspectionQuery })) as Record<string, any>;
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

  describe('config', () => {
    listConfigVariables.forEach(config => {
      test(JSON.stringify(config), async () => {
        const listKey = getListName(config);
        const gqlNames = getGqlNames({ listKey, pluralGraphQLName: `${listKey}s` });
        // The type is used in all the queries and mutations as a return type.
        if (config.omit === true) {
          expect(types).not.toContain(gqlNames.outputTypeName);
        } else {
          expect(types).toContain(gqlNames.outputTypeName);
        }
        // The whereUnique input type is used in queries and mutations, and
        // also in the relateTo input types.
        if (config.omit === true) {
          expect(types).not.toContain(gqlNames.whereUniqueInputName);
        } else {
          expect(types).toContain(gqlNames.whereUniqueInputName);
        }

        // The relateTo types do not exist if the list has been completely disabled
        if (config.omit === true) {
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

          if (config.omit === undefined || !config.omit.create) {
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
          // The connect/disconnect/set operations are always supported.
          expect(createFromMany).toContain('connect');
          expect(createFromOne).toContain('connect');
          expect(updateFromMany).toContain('connect');
          expect(updateFromOne).toContain('connect');
          expect(updateFromMany).toContain('disconnect');
          expect(updateFromOne).toContain('disconnect');
          expect(updateFromMany).toContain('set');
        }

        expect(types).toContain(gqlNames.whereInputName);

        // Queries are only accessible when reading
        if (config.omit !== true && (config.omit === undefined || !config.omit.query)) {
          expect(queries).toContain(gqlNames.itemQueryName);
          expect(queries).toContain(gqlNames.listQueryName);
          expect(queries).toContain(gqlNames.listQueryCountName);
        } else {
          expect(queries).not.toContain(gqlNames.itemQueryName);
          expect(queries).not.toContain(gqlNames.listQueryName);
          expect(queries).not.toContain(gqlNames.listQueryCountName);
        }

        if (config.omit !== true && (config.omit === undefined || !config.omit.create)) {
          expect(mutations).toContain(gqlNames.createMutationName);
        } else {
          expect(mutations).not.toContain(gqlNames.createMutationName);
        }

        if (config.omit !== true && (config.omit === undefined || !config.omit.update)) {
          expect(mutations).toContain(gqlNames.updateMutationName);
        } else {
          expect(mutations).not.toContain(gqlNames.updateMutationName);
        }

        if (config.omit !== true && (config.omit === undefined || !config.omit.delete)) {
          expect(mutations).toContain(gqlNames.deleteMutationName);
        } else {
          expect(mutations).not.toContain(gqlNames.deleteMutationName);
        }
      });
    });

    fieldMatrix.forEach(config => {
      for (const isFilterable of [undefined, false as const]) {
        for (const isOrderable of [undefined, false as const]) {
          const listName = getListName({ isFilterable, isOrderable });
          test(`schema - ${JSON.stringify(config)} on ${listName}`, () => {
            const name = getFieldName(config);

            expect(fieldTypes[listName].fields).not.toBe(null);
            const fields = fieldTypes[listName].fields;
            if (config.omit !== true && (config.omit === undefined || !config.omit.read)) {
              expect(fields[name]).not.toBe(undefined);
            } else {
              expect(fields[name]).toBe(undefined);
            }

            // Filters require both `read` and `filter` to be true for
            expect(fieldTypes[`${listName}WhereInput`].inputFields).not.toBe(undefined);
            if (
              config.omit !== true && // Not excluded
              (config.omit === undefined || !config.omit.read) && // Can read
              isFilterable !== false &&
              config.isFilterable !== false // Can filter
            ) {
              expect(fieldTypes[`${listName}WhereInput`].inputFields[name]).not.toBe(undefined);
            } else {
              expect(fieldTypes[`${listName}WhereInput`].inputFields[name]).toBe(undefined);
            }

            // Orderby require both `read` and `orderBy` to be true for
            expect(fieldTypes[`${listName}OrderByInput`].inputFields).not.toBe(undefined);
            if (
              config.omit !== true && // Not excluded
              (config.omit === undefined || !config.omit.read) && // Can read
              isOrderable !== false &&
              config.isOrderable !== false // Can orderBy
            ) {
              expect(fieldTypes[`${listName}OrderByInput`].inputFields[name]).not.toBe(undefined);
            } else {
              expect(fieldTypes[`${listName}OrderByInput`].inputFields[name]).toBe(undefined);
            }

            // Create inputs
            expect(fieldTypes[`${listName}CreateInput`].inputFields).not.toBe(undefined);

            if (
              config.omit !== true && // Not excluded
              (config.omit === undefined || !config.omit.create) // Can create
            ) {
              expect(fieldTypes[`${listName}CreateInput`].inputFields[name]).not.toBe(undefined);
            } else {
              expect(fieldTypes[`${listName}CreateInput`].inputFields[name]).toBe(undefined);
            }

            // Update inputs
            expect(fieldTypes[`${listName}UpdateInput`].inputFields).not.toBe(undefined);
            if (
              config.omit !== true && // Not excluded
              (config.omit === undefined || !config.omit.update) // Can update
            ) {
              expect(fieldTypes[`${listName}UpdateInput`].inputFields[name]).not.toBe(undefined);
            } else {
              expect(fieldTypes[`${listName}UpdateInput`].inputFields[name]).toBe(undefined);
            }
          });
          test(`adminMeta - isFilterable and isOrderable ${JSON.stringify(
            config
          )} on ${listName}`, async () => {
            const query = `
              query q($listName: String!) {
                keystone {
                  adminMeta {
                    list(key: $listName) {
                      fields {
                        path
                        isFilterable
                        isOrderable
                      }
                    }
                  }
                }
              }`;
            const variables = { listName };
            const { data, errors } = (await context.graphql.raw({
              query,
              variables,
            })) as ExecutionResult<any>;
            expect(errors).toBe(undefined);

            const field = data!.keystone.adminMeta.list.fields.filter(
              (f: any) => f.path === getFieldName(config)
            )[0];
            if (config.omit === true || config.omit?.read) {
              // FIXME: This code path will go away once the Admin UI supports `omit: ['read']` properly.
              expect(field).toBe(undefined);
            } else {
              // Filters require both `read` and `filter` to be true for
              if (
                // @ts-ignore
                config.omit !== true && // Not excluded
                (config.omit === undefined || !config.omit.read) && // Can read
                isFilterable !== false &&
                config.isFilterable !== false // Can filter
              ) {
                expect(field.isFilterable).toEqual(true);
              } else {
                expect(field.isFilterable).toEqual(false);
              }

              // Orderby require both `read` and `orderBy` to be true for
              if (
                // @ts-ignore
                config.omit !== true && // Not excluded
                (config.omit === undefined || !config.omit.read) && // Can read
                isOrderable !== false &&
                config.isOrderable !== false // Can orderBy
              ) {
                expect(field.isOrderable).toEqual(true);
              } else {
                expect(field.isOrderable).toEqual(false);
              }
            }
          });

          test(`adminMeta - not build mode ${JSON.stringify(config)} on ${listName}`, async () => {
            const query = `
              query q($listName: String!) {
                keystone {
                  adminMeta {
                    list(key: $listName) {
                      key
                      fields {
                        path
                        createView { fieldMode }
                        listView { fieldMode }
                        itemView(id: "blah") { fieldMode }
                      }
                    }
                  }
                }
              }`;
            const variables = { listName };

            const { data, errors } = (await context
              .withSession({})
              .graphql.raw({ query, variables })) as ExecutionResult<any>;
            expect(errors).toBe(undefined);

            const field = data!.keystone.adminMeta.list.fields.filter(
              (f: any) => f.path === getFieldName(config)
            )[0];

            if (config.omit === true || config.omit?.read) {
              // FIXME: This code path will go away once the Admin UI supports `omit: ['read']` properly.
              expect(field).toBe(undefined);
            } else {
              // createView - edit/hidden (hidden if omit.create)
              // @ts-ignore
              if (config.omit === true || config.omit?.create) {
                expect(field.createView.fieldMode).toEqual('hidden');
              } else {
                expect(field.createView.fieldMode).toEqual('edit');
              }

              // listView - read/hidden (hidden if omit.read)
              // @ts-ignore
              if (config.omit === true || config.omit?.read) {
                expect(field.listView.fieldMode).toEqual('hidden');
              } else {
                expect(field.listView.fieldMode).toEqual('read');
              }

              // itemView - edit/read/hidden (read if omit.update, hidden if omit.read)
              // @ts-ignore
              if (config.omit === true || config.omit?.read) {
                expect(field.itemView.fieldMode).toEqual('hidden');
              } else if (config.omit?.update) {
                expect(field.itemView.fieldMode).toEqual('read');
              } else {
                expect(field.itemView.fieldMode).toEqual('edit');
              }
            }
          });
        }
      }
    });
  });
});

describe(`Sudo schema`, () => {
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
    const data = (await context.sudo().graphql.run({ query: introspectionQuery })) as any;
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

  describe('config', () => {
    listConfigVariables.forEach(config => {
      test(JSON.stringify(config), async () => {
        const listKey = getListName(config);
        const gqlNames = getGqlNames({ listKey, pluralGraphQLName: `${listKey}s` });
        expect(types).toContain(gqlNames.outputTypeName);
        expect(types).toContain(gqlNames.whereUniqueInputName);
        expect(types).toContain(gqlNames.relateToManyForCreateInputName);
        expect(types).toContain(gqlNames.relateToOneForCreateInputName);
        expect(types).toContain(gqlNames.relateToManyForUpdateInputName);
        expect(types).toContain(gqlNames.relateToOneForUpdateInputName);
        const createFromMany = typesByName[gqlNames.relateToManyForCreateInputName].inputFields.map(
          ({ name }: { name: string }) => name
        );
        const createFromOne = typesByName[gqlNames.relateToOneForCreateInputName].inputFields.map(
          ({ name }: { name: string }) => name
        );
        const updateFromMany = typesByName[gqlNames.relateToManyForUpdateInputName].inputFields.map(
          ({ name }: { name: string }) => name
        );
        const updateFromOne = typesByName[gqlNames.relateToOneForUpdateInputName].inputFields.map(
          ({ name }: { name: string }) => name
        );
        expect(createFromMany).not.toContain('unusedPlaceholder');
        expect(createFromMany).toContain('create');
        expect(createFromOne).toContain('create');
        expect(updateFromMany).toContain('create');
        expect(updateFromOne).toContain('create');
        expect(createFromMany).toContain('connect');
        expect(createFromOne).toContain('connect');
        expect(updateFromMany).toContain('connect');
        expect(updateFromOne).toContain('connect');
        expect(updateFromMany).toContain('disconnect');
        expect(updateFromOne).toContain('disconnect');
        expect(updateFromMany).toContain('set');
        expect(types).toContain(gqlNames.whereInputName);
        expect(queries).toContain(gqlNames.itemQueryName);
        expect(queries).toContain(gqlNames.listQueryName);
        expect(queries).toContain(gqlNames.listQueryCountName);
        expect(mutations).toContain(gqlNames.createMutationName);
        expect(mutations).toContain(gqlNames.updateMutationName);
        expect(mutations).toContain(gqlNames.deleteMutationName);
      });
    });

    fieldMatrix.forEach(config => {
      for (const isFilterable of [undefined, false as const]) {
        for (const isOrderable of [undefined, false as const]) {
          const listName = getListName({ isFilterable, isOrderable });
          test(`${JSON.stringify(config)} on ${listName}`, () => {
            const name = getFieldName(config);

            expect(fieldTypes[listName].fields).not.toBe(null);
            const fields = fieldTypes[listName].fields;

            expect(fields[name]).not.toBe(undefined);
            expect(fieldTypes[`${listName}WhereInput`].inputFields).not.toBe(undefined);
            expect(fieldTypes[`${listName}WhereInput`].inputFields[name]).not.toBe(undefined);
            expect(fieldTypes[`${listName}OrderByInput`].inputFields).not.toBe(undefined);
            expect(fieldTypes[`${listName}OrderByInput`].inputFields[name]).not.toBe(undefined);
            expect(fieldTypes[`${listName}CreateInput`].inputFields).not.toBe(undefined);
            expect(fieldTypes[`${listName}CreateInput`].inputFields[name]).not.toBe(undefined);
            expect(fieldTypes[`${listName}UpdateInput`].inputFields).not.toBe(undefined);
            expect(fieldTypes[`${listName}UpdateInput`].inputFields[name]).not.toBe(undefined);
          });
        }
      }
    });
  });
});
