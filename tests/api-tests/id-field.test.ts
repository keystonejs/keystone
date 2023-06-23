import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { text } from '@keystone-6/core/fields';
import { setupTestRunner } from '@keystone-6/api-tests/test-runner';
import { isCuid } from 'cuid';
import { validate } from 'uuid';
import { apiTestConfig, dbProvider, expectBadUserInput } from './utils';

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
    error: 'Only a cuid can be passed to id filters',
    expect: (id: any, idStr: string) => {
      expect(isCuid(id)).toBe(true);
      expect(idStr).toBe(id);
    },
    reject: [null, 0, 1, 123, '', 'abc', 'abc123', 'asdfqwerty'],
  } as const,

  {
    kind: 'uuid',
    type: undefined,
    error: 'Only a uuid can be passed to id filters',
    expect: (id: any, idStr: string) => {
      expect(validate(id)).toBe(true);
      expect(idStr).toBe(id);
    },
    reject: [null, 0, 1, 123, '', 'abc', 'abc123', 'asdfqwerty'],
  } as const,

  {
    kind: 'string',
    type: undefined,
    error: 'Only a string can be passed to id filters',
    expect: (id: any, idStr: string) => {
      expect(isCuid(id)).toBe(true);
      expect(idStr).toBe(id);
    },
    reject: [null],
    //      reject: [null, 0, 1, 123], // TODO
  } as const,
];

for (const fixture of fixtures) {
  const runner = setupTestRunner({
    config: apiTestConfig({
      db: { idField: fixture },
      lists: {
        User: list({ access: allowAll, fields: { name: text() } }),
      },
    }),
  });

  const { kind, type, expect: expectFn, error } = fixture;
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

    for (const reject of fixture.reject) {
      const json = JSON.stringify(reject);

      test(
        `Throws an error when filtering (uniquely) with ${json}`,
        runner(async ({ context }) => {
          const { data, errors } = await context.graphql.raw({
            query: `{ user(where: { id: ${json} }) { id } }`,
          });
          expect(data).toEqual({ user: null });
          expectBadUserInput(errors, [{ path: ['user'], message: error }]);
        })
      );

      test(
        `Throws an error when filtering with ${json}`,
        runner(async ({ context }) => {
          const { data, errors } = await context.graphql.raw({
            query: `{ users(where: { id: { equals: ${json} } }) { id } }`,
          });
          expect(data).toEqual({ users: null });
          expectBadUserInput(errors, [{ path: ['users'], message: error }]);
        })
      );
    }

    test(
      `Throws an error when filter with { in: null }`,
      runner(async ({ context }) => {
        const { data, errors } = await context.graphql.raw({
          query: `{ users(where: { id: { in: null } }) { id } }`,
        });
        expect(data).toEqual({ users: null });
        expectBadUserInput(errors, [{ path: ['users'], message: `in id filter cannot be null` }]);
      })
    );

    test(
      `Throws an error when filter with { notIn: null }`,
      runner(async ({ context }) => {
        const { data, errors } = await context.graphql.raw({
          query: `{ users(where: { id: { notIn: null } }) { id } }`,
        });
        expect(data).toEqual({ users: null });
        expectBadUserInput(errors, [
          { path: ['users'], message: `notIn id filter cannot be null` },
        ]);
      })
    );
  });
}

describe('case insensitive id filters', () => {
  {
    const runner = setupTestRunner({
      config: apiTestConfig({
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

  {
    const runner = setupTestRunner({
      config: apiTestConfig({
        db: { idField: { kind: 'cuid' } },
        lists: {
          User: list({ access: allowAll, fields: { name: text() } }),
        },
      }),
    });
    test(
      'searching for uppercased cuid does not work',
      runner(async ({ context }) => {
        const { id } = (await context.query.User.createOne({
          data: { name: 'something' },
        })) as { id: string };

        const { data, errors } = await context.graphql.raw({
          query: `query q($id: ID!){ user(where: { id: $id }) { id } }`,
          variables: { id: id.toUpperCase() },
        });
        expect(data).toEqual({ user: null });
        expectBadUserInput(errors, [
          { path: ['user'], message: `Only a cuid can be passed to id filters` },
        ]);
      })
    );
  }
});
