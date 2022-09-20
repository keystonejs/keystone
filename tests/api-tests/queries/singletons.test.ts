import { text } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { setupTestRunner } from '@keystone-6/core/testing';
import { KeystoneContext } from '@keystone-6/core/types';
import { allowAll } from '@keystone-6/core/access';
import { apiTestConfig, dbProvider } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      Singular: list({
        isSingleton: true,
        access: allowAll,
        fields: {
          field: text(),
        },
      }),
    },
  }),
});

const initialiseData = async ({ context }: { context: KeystoneContext }) => {
  return await context.graphql.raw({
    query: `mutation { createSingular(data: {}) { id, field } }`,
  });
};

describe('queries "work" on singletons', () => {
  describe('read', () => {
    test(
      'read one works with defaulted query',
      runner(async ({ context }) => {
        await initialiseData({ context });

        const { errors, data } = await context.graphql.raw({
          query: `query { singular { id } }`,
        });

        expect(errors).toEqual(undefined);
        expect(data).toEqual({ singular: { id: '1' } });
      })
    );
    test(
      'read many works with defaulted query',
      runner(async ({ context }) => {
        await initialiseData({ context });

        const { errors, data } = await context.graphql.raw({
          query: `query { singulars { id } }`,
        });

        expect(errors).toEqual(undefined);
        expect(data).toEqual({ singulars: [{ id: '1' }] });
      })
    );
    test(
      'cannot query item with an ID other than 1',
      runner(async ({ context }) => {
        await initialiseData({ context });
        const { errors } = await context.graphql.raw({
          query: `query {
            singular(where: { id: 2 }) {
            id
          }
        }`,
        });

        expect(errors?.[0].message).toEqual(
          "Input error: The id field of a unique where input should be '1' for a singleton list"
        );
      })
    );
  });
  test(
    'create',
    runner(async ({ context }) => {
      const { errors, data } = await context.graphql.raw({
        query: `mutation { createSingular(data: {}) { id } }`,
      });

      expect(errors).toEqual(undefined);
      expect(data).toEqual({ createSingular: { id: '1' } });
    })
  );
  test(
    'update',
    runner(async ({ context }) => {
      const { data: initialData } = await initialiseData({ context });
      expect(initialData).toEqual({ createSingular: { field: '', id: '1' } });

      const { errors, data } = await context.graphql.raw({
        query: `mutation { updateSingular(data: { field: "something here" }) { id, field } }`,
      });

      expect(errors).toEqual(undefined);
      expect(data).toEqual({ updateSingular: { field: 'something here', id: '1' } });
    })
  );
  test(
    'delete',
    runner(async ({ context }) => {
      await initialiseData({ context });

      const { data, errors } = await context.graphql.raw({
        query: `mutation { deleteSingular { id, field } }`,
      });

      expect(errors).toEqual(undefined);
      expect(data).toEqual({ deleteSingular: { field: '', id: '1' } });

      const { data: queryData, errors: readErrors } = await context.graphql.raw({
        query: `query { singular { id } }`,
      });

      expect(readErrors).toEqual(undefined);
      expect(queryData).toEqual({ singular: null });
    })
  );
  test(
    'fails to create when existing item',
    runner(async ({ context }) => {
      await initialiseData({ context });

      const { errors } = await context.graphql.raw({
        query: `mutation { createSingular(data: { field: "Something here" }) { id } }`,
      });

      const message =
        dbProvider === 'mysql'
          ? 'Prisma error: Unique constraint failed on the constraint: `PRIMARY`'
          : 'Prisma error: Unique constraint failed on the fields: (`id`)';

      expect(errors?.[0].message).toEqual(message);
    })
  );
  test(
    'fails to create with differing ID',
    runner(async ({ context }) => {
      const { errors } = await context.graphql.raw({
        query: `mutation { createSingular(data: { id: 2, field: "Something here" }) { id } }`,
      });

      expect(errors?.[0].message).toEqual(
        `Field \"id\" is not defined by type \"SingularCreateInput\".`
      );
    })
  );
  // Testing these for certainty - nobody should be using these
  test(
    'create many',
    runner(async ({ context }) => {
      const { data, errors } = await context.graphql.raw({
        query: `mutation { createSingulars(data: [{ field: "Something here" }]) { id, field } }`,
      });

      expect(errors).toEqual(undefined);
      expect(data).toEqual({ createSingulars: [{ field: 'Something here', id: '1' }] });
    })
  );
  test(
    'update many',
    runner(async ({ context }) => {
      await initialiseData({ context });

      const { data, errors } = await context.graphql.raw({
        query: `mutation { updateSingulars(data: [{ data: { field: "Something here" } }]) { id, field } }`,
      });

      expect(errors).toEqual(undefined);
      expect(data).toEqual({ updateSingulars: [{ field: 'Something here', id: '1' }] });
    })
  );
  test(
    'delete many',
    runner(async ({ context }) => {
      await initialiseData({ context });

      const data = await context.graphql.run({
        query: `mutation { deleteSingulars(where: { id: 1 }) { id, field } }`,
      });

      expect(data).toEqual({ deleteSingulars: [{ id: '1', field: '' }] });
    })
  );
});
