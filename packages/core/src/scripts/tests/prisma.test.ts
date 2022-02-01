import execa from 'execa';
import stripAnsi from 'strip-ansi';
import { basicKeystoneConfig, cliBinPath, schemas, symlinkKeystoneDeps, testdir } from './utils';

// testing erroring when the schemas are not up to date is in artifacts.test.ts

test('keystone prisma exits with the same code as the prisma child process exits with', async () => {
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.js': basicKeystoneConfig,
  });
  const result = await execa('node', [cliBinPath, 'prisma', 'bad-thing'], {
    reject: false,
    all: true,
    cwd: tmp,
  });
  expect(result.exitCode).toBe(1);
  expect(stripAnsi(result.all!)).toMatchInlineSnapshot(`
    "
    ! Unknown command \\"bad-thing\\"

    ◭  Prisma is a modern DB toolkit to query, migrate and model your database (https://prisma.io)

    Usage

      $ prisma [command]

    Commands

                init   Setup Prisma for your app
            generate   Generate artifacts (e.g. Prisma Client)
                  db   Manage your database schema and lifecycle
             migrate   Migrate your database
              studio   Browse your data with Prisma Studio
              format   Format your schema

    Flags

         --preview-feature   Run Preview Prisma commands

    Examples

      Setup a new Prisma project
      $ prisma init

      Generate artifacts (e.g. Prisma Client)
      $ prisma generate

      Browse your data
      $ prisma studio

      Create migrations from your Prisma schema, apply them to the database, generate artifacts (e.g. Prisma Client)
      $ prisma migrate dev
      
      Pull the schema from an existing database, updating the Prisma schema
      $ prisma db pull

      Push the Prisma schema state to the database
      $ prisma db push
    "
  `);
});

test('keystone prisma uses the db url in the keystone config', async () => {
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    ...schemas,
    'keystone.js': basicKeystoneConfig,
  });
  const result = await execa('node', [cliBinPath, 'prisma', 'migrate', 'status'], {
    reject: false,
    all: true,
    cwd: tmp,
  });
  expect(result.exitCode).toBe(0);
  expect(stripAnsi(result.all!)).toMatchInlineSnapshot(`
    "Prisma schema loaded from schema.prisma
    Datasource \\"sqlite\\": SQLite database \\"app.db\\" at \\"file:./app.db\\"

    Database connection error:

    P1003: SQLite database file doesn't exist"
  `);
});
