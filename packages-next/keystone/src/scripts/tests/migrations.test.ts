import { text } from '@keystone-next/fields';
import fs from 'fs-extra';
import { requirePrismaClient } from '../../artifacts';
import { config, list } from '../../schema';
import { introspectDb, recordConsole, runCommand, symlinkKeystoneDeps, testdir } from './utils';

const basicLists = {
  Todo: list({
    fields: {
      title: text(),
    },
  }),
};

const dbUrl = 'file:./app.db';

const basicKeystoneConfig = (useMigrations: boolean) => ({
  kind: 'config' as const,
  config: config({
    db: { provider: 'sqlite', url: dbUrl, useMigrations },
    ui: { isDisabled: true },
    lists: basicLists,
  }),
});

async function setupAndStopDevServerForMigrations(cwd: string) {
  let stopServer = (await runCommand(cwd, 'dev')) as () => Promise<void>;
  await stopServer();
}

async function getGeneratedMigrationName(cwd: string, expectedNumberOfMigrations: number) {
  const prismaClient = new (requirePrismaClient(cwd))({
    datasources: { sqlite: { url: dbUrl } },
  });
  const migrations: {
    migration_name: string;
    finished_at: string;
  }[] = await prismaClient.$queryRaw(
    'SELECT migration_name,finished_at FROM _prisma_migrations ORDER BY finished_at DESC'
  );
  expect(migrations).toHaveLength(expectedNumberOfMigrations);
  expect(migrations.every(x => !!x.finished_at)).toBeTruthy();
  return migrations[0].migration_name;
}

// so that the timestamps in the logs are all 0ms
Date.now = () => 0;

describe('useMigrations: false', () => {
  test('creates database and pushes schema from empty', async () => {
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': basicKeystoneConfig(false),
    });
    const recording = recordConsole();
    await setupAndStopDevServerForMigrations(tmp);

    expect(await introspectDb(tmp, dbUrl)).toMatchInlineSnapshot(`
      "datasource db {
        provider = \\"sqlite\\"
        url      = \\"file:./app.db\\"
      }

      model Todo {
        id    Int     @id @default(autoincrement())
        title String?
      }
      "
    `);

    expect(recording()).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Dev Server Ready on http://localhost:3000
      ✨ Generating GraphQL and Prisma schemas
      ✨ sqlite database \\"app.db\\" created at file:./app.db
      ✨ Your database is now in sync with your schema. Done in 0ms
      ✨ Connecting to the database
      ✨ Skipping Admin UI code generation
      ✨ Creating server
      ✨ Preparing GraphQL Server
      ✨ Skipping Admin UI app
      👋 Admin UI and graphQL API ready"
    `);
  });
});

describe('useMigrations: true', () => {
  test('creates database, creates migration and applies from empty', async () => {
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': basicKeystoneConfig(true),
    });
    const recording = recordConsole({
      'Name of migration': 'init',
      'Would you like to apply this migration?': true,
    });
    await setupAndStopDevServerForMigrations(tmp);

    expect(await introspectDb(tmp, dbUrl)).toMatchInlineSnapshot(`
      "datasource db {
        provider = \\"sqlite\\"
        url      = \\"file:./app.db\\"
      }

      model Todo {
        id    Int     @id @default(autoincrement())
        title String?
      }
      "
    `);

    const migrationName = await getGeneratedMigrationName(tmp, 1);

    expect(await fs.readFile(`${tmp}/migrations/${migrationName}/migration.sql`, 'utf8'))
      .toMatchInlineSnapshot(`
      "-- CreateTable
      CREATE TABLE \\"Todo\\" (
          \\"id\\" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
          \\"title\\" TEXT
      );
      "
    `);

    expect(migrationName).toMatch(/\d+_init$/);

    expect(recording().replace(migrationName, 'migration_name')).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Dev Server Ready on http://localhost:3000
      ✨ Generating GraphQL and Prisma schemas
      ✨ sqlite database \\"app.db\\" created at file:./app.db
      ✨ There has been a change to your Keystone schema that requires a migration

      Prompt: Name of migration init
      ✨ A migration has been created at .keystone/prisma/migrations/migration_name
      Prompt: Would you like to apply this migration? true
      ✅ The migration has been applied
      ✨ Connecting to the database
      ✨ Skipping Admin UI code generation
      ✨ Creating server
      ✨ Preparing GraphQL Server
      ✨ Skipping Admin UI app
      👋 Admin UI and graphQL API ready"
    `);
  });
});
