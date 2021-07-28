import { GraphQLError } from 'graphql';
import { KeystoneContext } from '@keystone-next/types';
import { GraphQLRequest, setupTestEnv, TestEnv } from '@keystone-next/testing';
import { expectAccessDenied, expectGraphQLValidationError } from '../utils';
import {
  FAKE_ID,
  nameFn,
  listAccessVariations,
  fieldMatrix,
  getFieldName,
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  config,
} from './utils';

const expectNoAccess = <N extends string>(
  data: Record<N, null> | null | undefined,
  errors: readonly GraphQLError[] | undefined,
  name: N
) => {
  expect(data?.[name]).toBe(null);
  expectAccessDenied(errors, [{ path: [name] }]);
};

type IdType = any;

describe(`Not authed`, () => {
  let testEnv: TestEnv, context: KeystoneContext, graphQLRequest: GraphQLRequest;
  let items: Record<string, { id: IdType; name: string }[]>;
  let provider = config.db.provider!;
  beforeAll(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;
    graphQLRequest = testEnv.testArgs.graphQLRequest;

    await testEnv.connect();

    // ensure every list has at least some data
    const initialData: Record<string, { name: string }[]> = listAccessVariations.reduce(
      (acc, access) =>
        Object.assign(acc, {
          [getStaticListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
          [getImperativeListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
          [getDeclarativeListName(access)]: [{ name: 'Hello' }, { name: 'Hi' }],
        }),
      {}
    );
    items = {};
    for (const [listKey, _items] of Object.entries(initialData)) {
      items[listKey] = (await context.sudo().lists[listKey].createMany({
        data: _items.map(x => ({ data: x })),
        query: 'id, name',
      })) as { id: IdType; name: string }[];
    }
  });
  afterAll(async () => {
    await testEnv.disconnect();
  });

  describe('create', () => {
    (['imperative'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations
          .filter(({ create }) => !create)
          .forEach(access => {
            test(`denied: ${JSON.stringify(access)}`, async () => {
              const createMutationName = `create${nameFn[mode](access)}`;
              const query = `mutation { ${createMutationName}(data: { name: "bar" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectNoAccess(data, errors, createMutationName);
            });
          });
      });
    });

    (['static'] as const).forEach(mode => {
      describe(mode, () => {
        fieldMatrix
          .filter(({ create }) => !create)
          .forEach(access => {
            test(`field not allowed: ${JSON.stringify(access)}`, async () => {
              const listAccess = {
                create: true,
                read: true,
                update: true,
                delete: true,
              };
              const createMutationName = `create${nameFn[mode](listAccess)}`;
              const fieldName = getFieldName(access);
              const query = `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id ${fieldName} } }`;
              const { body } = await graphQLRequest({ query });
              // If create is not allowed on a field then there will be a query validation error
              if (access.read) {
                const message = `Field "${fieldName}" is not defined by type "${nameFn[mode](
                  listAccess
                )}CreateInput".`;
                expectGraphQLValidationError(body.errors, [
                  { message: expect.stringContaining(message) },
                ]);
              } else {
                expectGraphQLValidationError(body.errors, [
                  {
                    message: expect.stringContaining(
                      `Field "${fieldName}" is not defined by type "${nameFn[mode](
                        listAccess
                      )}CreateInput".`
                    ),
                  },
                  {
                    message: expect.stringContaining(
                      `Cannot query field "${fieldName}" on type "${nameFn[mode](listAccess)}".`
                    ),
                  },
                ]);
              }
              expect(body.data).toBe(undefined);
            });
          });
      });
    });
    (['imperative'] as const).forEach(mode => {
      describe(mode, () => {
        fieldMatrix
          .filter(({ create }) => !create)
          .forEach(access => {
            test(`field not allowed: ${JSON.stringify(access)}`, async () => {
              const listAccess = {
                create: true,
                read: true,
                update: true,
                delete: true,
              };
              const createMutationName = `create${nameFn[mode](listAccess)}`;
              const fieldName = getFieldName(access);
              const query = `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(data).toEqual({ [createMutationName]: null });
              expectAccessDenied(errors, [{ path: [createMutationName] }]);
            });
          });
      });
    });
  });

  describe('read', () => {
    (['imperative', 'declarative'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations
          .filter(({ read }) => !read)
          .forEach(access => {
            test(`'all' denied: ${JSON.stringify(access)}`, async () => {
              const allQueryName = context.gqlNames(nameFn[mode](access)).listQueryName;
              const query = `query { ${allQueryName} { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectNoAccess(data, errors, allQueryName);
            });

            test(`count denied: ${JSON.stringify(access)}`, async () => {
              const countName = `${
                nameFn[mode](access).slice(0, 1).toLowerCase() + nameFn[mode](access).slice(1)
              }sCount`;
              const query = `query { ${countName} }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(data).toEqual({ [countName]: null });
              expectAccessDenied(errors, [{ path: [countName] }]);
            });

            test(`single denied: ${JSON.stringify(access)}`, async () => {
              const singleQueryName = context.gqlNames(nameFn[mode](access)).itemQueryName;
              const query = `query { ${singleQueryName}(where: { id: "cabc123" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectNoAccess(data, errors, singleQueryName);
            });
          });
      });
    });
    (['imperative'] as const).forEach(mode => {
      describe(mode, () => {
        fieldMatrix
          .filter(({ read }) => !read)
          .forEach(access => {
            test(`field allowed - singular: ${JSON.stringify(access)}`, async () => {
              const listAccess = {
                create: true,
                read: true,
                update: true,
                delete: true,
              };
              const listKey = nameFn[mode](listAccess);
              const item = items[listKey][0];
              const fieldName = getFieldName(access);
              const singleQueryName = context.gqlNames(listKey).itemQueryName;
              await context
                .sudo()
                .lists[listKey].updateOne({
                  where: { id: item.id },
                  data: { [fieldName]: 'hello' },
                });
              const query = `query { ${singleQueryName}(where: { id: "${item.id}" }) { id ${fieldName} } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectAccessDenied(errors, [{ path: [singleQueryName, fieldName] }]);
              expect(data).toEqual({ [singleQueryName]: { id: item.id, [fieldName]: null } });
            });
            test(`field allowed - multi: ${JSON.stringify(access)}`, async () => {
              const listAccess = {
                create: true,
                read: true,
                update: true,
                delete: true,
              };
              const listKey = nameFn[mode](listAccess);
              const item = items[listKey][0];
              const fieldName = getFieldName(access);
              const allQueryName = context.gqlNames(listKey).listQueryName;
              await context
                .sudo()
                .lists[listKey].updateOne({
                  where: { id: item.id },
                  data: { [fieldName]: 'hello' },
                });
              const query = `query { ${allQueryName} { id ${fieldName} } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectAccessDenied(errors, [
                { path: [allQueryName, 0, fieldName] },
                { path: [allQueryName, 1, fieldName] },
              ]);
              expect(data).toEqual({
                [allQueryName]: [
                  { id: expect.any(String), [fieldName]: null },
                  { id: expect.any(String), [fieldName]: null },
                ],
              });
            });
          });
      });
    });
    (['static'] as const).forEach(mode => {
      describe(mode, () => {
        fieldMatrix
          .filter(({ read }) => !read)
          .forEach(access => {
            test(`field allowed - singular: ${JSON.stringify(access)}`, async () => {
              const listAccess = { create: true, read: true, update: true, delete: true };
              const listKey = nameFn[mode](listAccess);
              const item = items[listKey][0];
              const fieldName = getFieldName(access);
              const singleQueryName = context.gqlNames(listKey).itemQueryName;
              await context
                .sudo()
                .lists[listKey].updateOne({
                  where: { id: item.id },
                  data: { [fieldName]: 'hello' },
                });
              const query = `query { ${singleQueryName}(where: { id: "${item.id}" }) { id ${fieldName} } }`;
              const { body } = await graphQLRequest({ query });
              expectGraphQLValidationError(body.errors, [
                {
                  message: expect.stringContaining(
                    `Cannot query field "${fieldName}" on type "${listKey}".`
                  ),
                },
              ]);
              expect(body.data).toBe(undefined);
            });
            test(`field allowed - multi: ${JSON.stringify(access)}`, async () => {
              const listAccess = { create: true, read: true, update: true, delete: true };
              const listKey = nameFn[mode](listAccess);
              const item = items[listKey][0];
              const fieldName = getFieldName(access);
              const allQueryName = context.gqlNames(listKey).listQueryName;
              await context
                .sudo()
                .lists[listKey].updateOne({
                  where: { id: item.id },
                  data: { [fieldName]: 'hello' },
                });
              const query = `query { ${allQueryName} { id ${fieldName} } }`;
              const { body } = await graphQLRequest({ query });
              expectGraphQLValidationError(body.errors, [
                {
                  message: expect.stringContaining(
                    `Cannot query field "${fieldName}" on type "${listKey}".`
                  ),
                },
              ]);
              expect(body.data).toBe(undefined);
            });
          });
      });
    });
  });

  describe('update', () => {
    (['imperative', 'declarative'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations
          .filter(({ update }) => !update)
          .forEach(access => {
            test(`denies: ${JSON.stringify(access)}`, async () => {
              const updateMutationName = `update${nameFn[mode](access)}`;
              const query = `mutation { ${updateMutationName}(id: "${FAKE_ID[provider]}", data: { name: "bar" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectNoAccess(data, errors, updateMutationName);
            });
          });
      });
    });

    (['static'] as const).forEach(mode => {
      describe(mode, () => {
        fieldMatrix
          .filter(({ update }) => !update)
          .forEach(access => {
            test(`field not allowed: ${JSON.stringify(access)}`, async () => {
              const listAccess = {
                create: true,
                read: true,
                update: true,
                delete: true,
              };
              const updateMutationName = `update${nameFn[mode](listAccess)}`;
              const listKey = nameFn[mode](listAccess);
              const item = items[listKey][0];
              const fieldName = getFieldName(access);
              const query = `mutation { ${updateMutationName}(id: "${
                item.id
              }", data: { ${fieldName}: "bar" }) { id ${access.read ? fieldName : ''} } }`;
              const { body } = await graphQLRequest({ query });
              // If update is not allowed on a field then there will be a query validation error
              expectGraphQLValidationError(body.errors, [
                {
                  message: expect.stringContaining(
                    `Field "${fieldName}" is not defined by type "${listKey}UpdateInput".`
                  ),
                },
              ]);
              expect(body.data).toBe(undefined);
            });
          });
      });
    });
    (['imperative'] as const).forEach(mode => {
      describe(mode, () => {
        fieldMatrix
          .filter(({ update }) => !update)
          .forEach(access => {
            test(`field not allowed: ${JSON.stringify(access)}`, async () => {
              const listAccess = {
                create: true,
                read: true,
                update: true,
                delete: true,
              };
              const updateMutationName = `update${nameFn[mode](listAccess)}`;
              const listKey = nameFn[mode](listAccess);
              const item = items[listKey][0];
              const fieldName = getFieldName(access);
              const query = `mutation { ${updateMutationName}(id: "${item.id}", data: { ${fieldName}: "bar" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expect(data).toEqual({ [updateMutationName]: null });
              expectAccessDenied(errors, [{ path: [updateMutationName] }]);
            });
          });
      });
    });
  });

  describe('delete', () => {
    (['imperative', 'declarative'] as const).forEach(mode => {
      describe(mode, () => {
        listAccessVariations
          .filter(access => !access.delete)
          .forEach(access => {
            test(`single denied: ${JSON.stringify(access)}`, async () => {
              const deleteMutationName = `delete${nameFn[mode](access)}`;
              const query = `mutation { ${deleteMutationName}(where: {id: "${FAKE_ID[provider]}" }) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });
              expectNoAccess(data, errors, deleteMutationName);
            });

            test(`multi denied: ${JSON.stringify(access)}`, async () => {
              const multiDeleteMutationName = `delete${nameFn[mode](access)}s`;
              const query = `mutation { ${multiDeleteMutationName}(where: [{ id: "${FAKE_ID[provider]}" }]) { id } }`;
              const { data, errors } = await context.graphql.raw({ query });

              expect(data).toEqual({ [multiDeleteMutationName]: [null] });
              expectAccessDenied(errors, [{ path: [multiDeleteMutationName, 0] }]);
            });
          });
      });
    });
  });
});
