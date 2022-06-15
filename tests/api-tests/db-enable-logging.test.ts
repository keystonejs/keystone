import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { setupTestRunner } from '@keystone-6/core/testing';
import stripAnsi from 'strip-ansi';
import { apiTestConfig, dbProvider } from './utils';

const runner = (enableLogging: boolean) =>
  setupTestRunner({
    config: apiTestConfig({
      db: { enableLogging },
      lists: {
        User: list({ fields: { name: text() } }),
      },
    }),
  });

test(
  'enableLogging: true enables logging',
  runner(true)(async ({ context }) => {
    let prevConsoleLog = console.log;
    let logs: unknown[][] = [];
    console.log = (...args) => {
      logs.push(args.map(x => (typeof x === 'string' ? stripAnsi(x) : x)));
    };
    try {
      expect(await context.query.User.findMany()).toEqual([]);
      expect(logs).toEqual([
        [
          'prisma:query',
          dbProvider === 'sqlite'
            ? 'SELECT `main`.`User`.`id`, `main`.`User`.`name` FROM `main`.`User` WHERE 1=1 LIMIT ? OFFSET ?'
            : 'SELECT "public"."User"."id", "public"."User"."name" FROM "public"."User" WHERE 1=1 OFFSET $1',
        ],
      ]);
    } finally {
      console.log = prevConsoleLog;
    }
  })
);

test(
  'enableLogging: false does not enable logging',
  runner(false)(async ({ context }) => {
    let prevConsoleLog = console.log;
    let didLog = false;
    console.log = () => {
      didLog = true;
    };
    try {
      expect(await context.query.User.findMany()).toEqual([]);
      expect(didLog).toEqual(false);
    } finally {
      console.log = prevConsoleLog;
    }
  })
);
