import { KeystoneContext } from '@keystone-next/keystone/types';
import { setupTestEnv, TestEnv } from '@keystone-next/keystone/testing';
import { expectAccessDenied } from '../utils';
import { nameFn, fieldMatrix, getFieldName, getItemListName, config } from './utils';

type IdType = any;

describe(`Field access`, () => {
  const listAccess = { create: true, query: true, update: true, delete: true };
  const mode = 'item';
  const listKey = nameFn[mode](listAccess);

  let testEnv: TestEnv, context: KeystoneContext;
  let items: Record<string, { id: IdType; name: string }[]>;
  beforeAll(async () => {
    testEnv = await setupTestEnv({ config });
    context = testEnv.testArgs.context;

    await testEnv.connect();

    const initialData = { [getItemListName(listAccess)]: [{ name: 'Hello' }, { name: 'Hi' }] };

    items = {};
    for (const [listKey, _items] of Object.entries(initialData)) {
      items[listKey] = (await context.sudo().lists[listKey].createMany({
        data: _items,
        query: 'id, name',
      })) as { id: IdType; name: string }[];
    }
  });
  afterAll(async () => {
    await testEnv.disconnect();
  });

  describe('read', () => {
    fieldMatrix.forEach(access => {
      test(`field allowed - singular: ${JSON.stringify(access)}`, async () => {
        const item = items[listKey][0];
        const fieldName = getFieldName(access);
        const singleQueryName = context.gqlNames(listKey).itemQueryName;
        await context.sudo().lists[listKey].updateOne({
          where: { id: item.id },
          data: { [fieldName]: 'hello' },
        });
        const query = `query { ${singleQueryName}(where: { id: "${item.id}" }) { id ${fieldName} } }`;
        const { data, errors } = await context.graphql.raw({ query });
        expect(errors).toBe(undefined);
        if (!access.query) {
          expect(data![singleQueryName]).toEqual({ id: item.id, [fieldName]: null });
        } else {
          expect(data![singleQueryName]).toEqual({ id: item.id, [fieldName]: 'hello' });
        }
      });
      test(`field allowed - multi: ${JSON.stringify(access)}`, async () => {
        const item = items[listKey][0];
        const fieldName = getFieldName(access);
        const allQueryName = context.gqlNames(listKey).listQueryName;
        await context.sudo().lists[listKey].updateOne({
          where: { id: item.id },
          data: { [fieldName]: 'hello' },
        });
        const query = `query { ${allQueryName} { id ${fieldName} } }`;
        const { data, errors } = await context.graphql.raw({ query });
        expect(errors).toBe(undefined);
        if (!access.query) {
          expect(data).toEqual({
            [allQueryName]: [
              { id: expect.any(String), [fieldName]: null },
              { id: expect.any(String), [fieldName]: null },
            ],
          });
        } else {
          expect(data![allQueryName]).toHaveLength(2);
          expect(data![allQueryName]).toContainEqual({ id: expect.any(String), [fieldName]: null });
          expect(data![allQueryName]).toContainEqual({ id: item.id, [fieldName]: 'hello' });
        }
      });
    });
  });

  describe('create', () => {
    fieldMatrix.forEach(access => {
      test(`field not allowed: ${JSON.stringify(access)}`, async () => {
        const createMutationName = `create${nameFn[mode](listAccess)}`;
        const fieldName = getFieldName(access);
        const query = `mutation { ${createMutationName}(data: { ${fieldName}: "bar" }) { id ${fieldName} } }`;
        const { data, errors } = await context.graphql.raw({ query });
        if (!access.create) {
          expect(data).toEqual({ [createMutationName]: null });
          expectAccessDenied(errors, [
            {
              path: [createMutationName],
              msg: `You cannot perform the 'create' operation on the item '{"${fieldName}":"bar"}'. You cannot create the fields ["${fieldName}"].`,
            },
          ]);
        } else {
          expect(errors).toBe(undefined);
          if (access.query) {
            expect(data![createMutationName]).toEqual({
              id: expect.any(String),
              [fieldName]: 'bar',
            });
          } else {
            expect(data![createMutationName]).toEqual({
              id: expect.any(String),
              [fieldName]: null,
            });
          }
        }
      });
    });
  });

  describe('update', () => {
    fieldMatrix.forEach(access => {
      test(`field not allowed: ${JSON.stringify(access)}`, async () => {
        const item = items[listKey][0];
        const fieldName = getFieldName(access);
        const updateMutationName = `update${nameFn[mode](listAccess)}`;
        const query = `mutation { ${updateMutationName}(where: { id: "${item.id}" }, data: { ${fieldName}: "bar" }) { id ${fieldName} } }`;
        const { data, errors } = await context.graphql.raw({ query });
        if (!access.update) {
          expect(data).toEqual({ [updateMutationName]: null });
          expectAccessDenied(errors, [
            {
              path: [updateMutationName],
              msg: `You cannot perform the 'update' operation on the item '{"id":"${item.id}"}'. You cannot update the fields ["${fieldName}"].`,
            },
          ]);
        } else {
          expect(errors).toBe(undefined);
          if (access.query) {
            expect(data![updateMutationName]).toEqual({ id: item.id, [fieldName]: 'bar' });
          } else {
            expect(data![updateMutationName]).toEqual({ id: item.id, [fieldName]: null });
          }
        }
      });
    });
  });
});
