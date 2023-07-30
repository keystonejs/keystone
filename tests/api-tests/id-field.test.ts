import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { text } from '@keystone-6/core/fields';
import { setupTestRunner } from '@keystone-6/api-tests/test-runner';
import { isCuid } from 'cuid';
import { isCuid as isCuid2, createId as createCuid2 } from '@paralleldrive/cuid2';
import { validate as isUuid } from 'uuid';
import { testConfig, dbProvider, expectBadUserInput } from './utils';

export function assertNever(arg: never) {
  throw new Error('expected to never be called but received: ' + JSON.stringify(arg));
}

const fixtures = [
  {
    kind: 'autoincrement',
    type: 'Int',
    error: 'Only a int can be passed to id filters',
    expect: (id: any, idStr: string) => {
      expect(id).toBe(1);
      expect(idStr).toEqual('1');
    },
    reject: [null, '', 'abc', 'abc123', 'asdfqwerty'],
  } as const,
  ...(dbProvider === 'sqlite'
    ? []
    : ([
        {
          kind: 'autoincrement',
          type: 'BigInt',
          error: 'Only a bigint can be passed to id filters',
          expect: (id: any, idStr: string) => {
            expect(id).toBe(1n);
            expect(idStr).toEqual('1');
          },
          reject: [null, '', 'abc', 'abc123', 'asdfqwerty'],
        } as const,
      ] as const)),

  {
    kind: 'cuid',
    type: undefined,
    error: 'Only a string can be passed to id filters',
    expect: (id: any, idStr: string) => {
      expect(typeof id).toBe('string');
      expect(isCuid(id)).toBe(true);
      expect(idStr).toBe(id);
    },
    reject: [null],
  } as const,

  {
    kind: 'cuid2',
    type: undefined,
    error: 'Only a string can be passed to id filters',
    expect: (id: any, idStr: string) => {
      expect(typeof id).toBe('string');
      expect(id.length).toBe(24);
      expect(isCuid2(id)).toBe(true);
      expect(idStr).toBe(id);
    },
    reject: [null],
  } as const,

  {
    kind: 'uuid',
    type: undefined,
    error: 'Only a string can be passed to id filters',
    expect: (id: any, idStr: string) => {
      expect(typeof id).toBe('string');
      expect(isUuid(id)).toBe(true);
      expect(idStr).toBe(id);
    },
    reject: [null],
  } as const,

  {
    kind: 'string',
    type: undefined,
    error: 'Only a string can be passed to id filters',
    expect: (id: any, idStr: string) => {
      expect(typeof id).toBe('string');
      expect(isCuid2(id)).toBe(true);
      expect(idStr).toBe(id);
    },
    reject: [null],
    hooks: {
      resolveInput: {
        create: ({ resolvedData }: any) => {
          return {
            ...resolvedData,
            id: createCuid2(),
          };
        },
      },
    },
  } as const,
];

for (const fixture of fixtures) {
  const { expect: expectFn, error, hooks = {}, ...idField } = fixture;
  const runner = setupTestRunner({
    config: testConfig({
      db: {
        idField,
      },
      lists: {
        User: list({
          access: allowAll,
          fields: {
            name: text(),
          },
          hooks,
        }),
      },
    }),
  });

  const { kind, type } = idField;
  const name = `${kind}:${type ?? ''}`;

  describe(name, () => {
    test(
      `Create defaults to the expected identifier type`,
      runner(async ({ context }) => {
        const { id } = await context.query.User.createOne({ data: { name: 'something' } });
        const dbItem = await context.db.User.findOne({ where: { id } });

        expect(dbItem).not.toBe(null);
        if (!dbItem) return;
        expectFn(dbItem.id, id);
      })
    );

    test(
      `Querying succeeds for a findOne`,
      runner(async ({ context }) => {
        const { id } = await context.query.User.createOne({ data: { name: 'something' } });
        await context.query.User.createOne({ data: { name: 'another' } });
        const item = await context.query.User.findOne({ where: { id } });
        expect(item.id).toBe(id);
      })
    );

    test(
      `Querying succeeds for a findMany`,
      runner(async ({ context }) => {
        const { id } = await context.query.User.createOne({ data: { name: 'something' } });
        await context.query.User.createOne({ data: { name: 'another' } });
        const items = await context.query.User.findMany({ where: { id: { equals: id } } });
        expect(items).toHaveLength(1);
        expect(items[0].id).toBe(id);
      })
    );

    test(
      `Querying returns [] for a findMany with a null notIn filter`,
      runner(async ({ context }) => {
        const items = await context.query.User.findMany({ where: { id: { notIn: null } } });
        expect(items).toStrictEqual([]);
      })
    );

    for (const id of fixture.reject) {
      test(
        `Throws an error when filtering (uniquely) with ${JSON.stringify(id)}`,
        runner(async ({ context }) => {
          const { data, errors } = await context.graphql.raw({
            query: `query ($id: ID) { user(where: { id: $id }) { id } }`,
            variables: { id },
          });
          expectBadUserInput(errors, [{ path: ['user'], message: error }]);
          expect(data).toEqual({ user: null });
        })
      );

      test(
        `Throws an error when filtering with ${JSON.stringify(id)}`,
        runner(async ({ context }) => {
          const { data, errors } = await context.graphql.raw({
            query: `query ($id: ID) { users(where: { id: { equals: $id } }) { id } }`,
            variables: { id },
          });
          expectBadUserInput(errors, [{ path: ['users'], message: error }]);
          expect(data).toEqual({ users: null });
        })
      );
    }
  });
}

// TODO: remove, this should be on the user
describe('case insensitive id filters', () => {
  {
    const runner = setupTestRunner({
      config: testConfig({
        db: { idField: { kind: 'uuid' } },
        lists: {
          User: list({ access: allowAll, fields: { name: text() } }),
        },
      }),
    });
    test(
      'searching for uppercased uuid works',
      runner(async ({ context }) => {
        const { id } = (await context.query.User.createOne({
          data: { name: 'something' },
        })) as { id: string };
        const { id: fromFound } = await context.query.User.findOne({
          where: { id: id.toUpperCase() },
        });
        // it returns lower-cased
        expect(fromFound).toBe(id);
      })
    );
  }
});
