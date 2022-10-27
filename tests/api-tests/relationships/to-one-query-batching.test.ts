import { isDeepStrictEqual } from 'util';
import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { relationship, text } from '@keystone-6/core/fields';
import stripAnsi from 'strip-ansi';
import { setupTestRunner } from '../test-runner';
import { apiTestConfig, dbProvider, dbName } from '../utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    db: { enableLogging: true },
    lists: {
      Post: list({
        access: {
          operation: allowAll,
          filter: { query: () => ({ title: { not: { contains: 'Secret' } } }) },
        },
        fields: {
          title: text(),
          author: relationship({ ref: 'User.posts', many: false }),
        },
      }),
      User: list({
        access: {
          operation: allowAll,
          filter: { query: () => ({ name: { contains: 'User' } }) },
        },
        fields: {
          name: text(),
          posts: relationship({ ref: 'Post.author', many: true }),
        },
      }),
    },
  }),
});

test(
  'to-one relationship query batching',
  runner(async ({ context }) => {
    let prevConsoleLog = console.log;
    console.log = () => {};
    try {
      await context.query.User.createMany({
        data: Array.from({ length: 10 }, (_, i) => ({
          name: `User ${i}`,
          posts: {
            create: [{ title: `Post from User ${i}` }, { title: `Secret post from User ${i}` }],
          },
        })),
      });
    } finally {
      console.log = prevConsoleLog;
    }

    let logs: unknown[][] = [];
    console.log = (...args) => {
      logs.push(args.map(x => (typeof x === 'string' ? stripAnsi(x) : x)));
    };

    try {
      expect(
        await context.query.Post.findMany({
          query: 'title author { name }',
          orderBy: { title: 'asc' },
        })
      ).toEqual(
        Array.from({ length: 10 }, (_, i) => ({
          title: `Post from User ${i}`,
          author: { name: `User ${i}` },
        }))
      );

      // the logs from the createMany are sometimes (it only seems to happen on postgres on ci)
      // logged after the createMany resolves
      // so we just ignore those queries (they always end in with a `COMMIT`)
      // ideally would be findLastIndex but that's not in node 16
      const commitIndex = logs.findLastIndex(val =>
        isDeepStrictEqual(val, ['prisma:query', 'COMMIT'])
      );
      if (commitIndex !== -1) {
        logs = logs.slice(commitIndex + 1);
      }
      expect(logs).toEqual([
        ['prisma:query', expect.stringContaining('SELECT')],
        ['prisma:query', expect.stringContaining('SELECT')],
      ]);
      const expectedSql = {
        sqlite: [
          'SELECT `main`.`Post`.`id`, `main`.`Post`.`title`, `main`.`Post`.`author` FROM `main`.`Post` WHERE `main`.`Post`.`title` NOT LIKE ? ORDER BY `main`.`Post`.`title` ASC LIMIT ? OFFSET ? /* traceparent=00-00-00-00 */',
          'SELECT `main`.`User`.`id`, `main`.`User`.`name` FROM `main`.`User` WHERE (`main`.`User`.`id` IN (?,?,?,?,?,?,?,?,?,?) AND `main`.`User`.`name` LIKE ?) LIMIT ? OFFSET ? /* traceparent=00-00-00-00 */',
        ],
        postgresql: [
          `SELECT "public"."Post"."id", "public"."Post"."title", "public"."Post"."author" FROM "public"."Post" WHERE "public"."Post"."title"::text NOT LIKE $1 ORDER BY "public"."Post"."title" ASC OFFSET $2 /* traceparent=00-00-00-00 */`,
          `SELECT "public"."User"."id", "public"."User"."name" FROM "public"."User" WHERE ("public"."User"."id" IN ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) AND "public"."User"."name"::text LIKE $11) OFFSET $12 /* traceparent=00-00-00-00 */`,
        ],
        mysql: [
          `SELECT \`${dbName}\`.\`Post\`.\`id\`, \`${dbName}\`.\`Post\`.\`title\`, \`${dbName}\`.\`Post\`.\`author\` FROM \`${dbName}\`.\`Post\` WHERE \`${dbName}\`.\`Post\`.\`title\` NOT LIKE ? ORDER BY \`${dbName}\`.\`Post\`.\`title\` ASC /* traceparent=00-00-00-00 */`,
          `SELECT \`${dbName}\`.\`User\`.\`id\`, \`${dbName}\`.\`User\`.\`name\` FROM \`${dbName}\`.\`User\` WHERE (\`${dbName}\`.\`User\`.\`id\` IN (?,?,?,?,?,?,?,?,?,?) AND \`${dbName}\`.\`User\`.\`name\` LIKE ?) /* traceparent=00-00-00-00 */`,
        ],
      }[dbProvider];
      const sql = logs.map(([, query]) => query);
      expect(sql).toEqual(expectedSql);
    } finally {
      console.log = prevConsoleLog;
    }
  })
);

// TODO: remove this when it's added to TS's lib files
declare global {
  interface Array<T> {
    findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number;
  }
}
