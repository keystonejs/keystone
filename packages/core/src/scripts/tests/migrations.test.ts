import path from 'path';
import fs from 'fs-extra';
import execa from 'execa';
import { setSkipWatching } from '../run/dev';
import { ExitError } from '../utils';
import {
  cliBinPath,
  getFiles,
  introspectDb,
  recordConsole,
  runCommand,
  symlinkKeystoneDeps,
  testdir,
} from './utils';

// watching with esbuild inside of jest goes _weird_
// esbuild doesn't seem to let you wait for the cleanup
setSkipWatching();

const dbUrl = 'file:./app.db';

function getPrismaClient(cwd: string) {
  return new (require(path.join(cwd, 'node_modules/.testprisma/client')).PrismaClient)({
    datasources: { sqlite: { url: dbUrl } },
  });
}

async function getGeneratedMigration(
  cwd: string,
  expectedNumberOfMigrations: number,
  expectedName: string
) {
  const prismaClient = getPrismaClient(cwd);
  const migrations: {
    migration_name: string;
    finished_at: string;
  }[] =
    await prismaClient.$queryRaw`SELECT migration_name,finished_at FROM _prisma_migrations ORDER BY finished_at DESC`;
  await prismaClient.$disconnect();
  expect(migrations).toHaveLength(expectedNumberOfMigrations);
  expect(migrations.every(x => !!x.finished_at)).toBeTruthy();
  const migrationName = migrations[0].migration_name;
  expect(migrationName).toMatch(new RegExp(`\\d+_${expectedName}$`));
  const migrationFilepath = `${cwd}/migrations/${migrationName}/migration.sql`;
  const migration = await fs.readFile(migrationFilepath, 'utf8');
  return { migration, migrationFilepath, migrationName };
}

// so that the timestamps in the logs are all 0ms
Date.now = () => 0;

function cleanOutputForApplyingMigration(output: string, generatedMigrationName: string) {
  // sometimes "✅ The migration has been applied" is printed in a different order which messes up the snapshots
  // so we just assert the text exists somewhere and remove it from what we snapshot
  expect(output).toContain('✅ The migration has been applied\n');
  return output
    .replace(new RegExp(generatedMigrationName, 'g'), 'migration_name')
    .replace('✅ The migration has been applied\n', '');
}

const basicKeystoneConfig = fs.readFileSync(`${__dirname}/fixtures/basic-with-no-ui.ts`, 'utf8');

async function setupInitialProjectWithoutMigrations() {
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    'keystone.js': basicKeystoneConfig,
  });
  const recording = recordConsole();

  await runCommand(tmp, 'dev');
  expect(await introspectDb(tmp, dbUrl)).toEqual(`datasource db {
  provider = "sqlite"
  url      = "file:./app.db"
}

model Todo {
  id    String @id
  title String @default("")
}
`);

  expect(recording()).toEqual(`✨ Starting Keystone
⭐️ Server listening on :3000 (http://localhost:3000/)
⭐️ GraphQL API available at /api/graphql
✨ Generating GraphQL and Prisma schemas
✨ sqlite database "app.db" created at file:./app.db
✨ Your database is now in sync with your schema. Done in 0ms
✨ Connecting to the database
✨ Creating server
✅ GraphQL API ready`);
  return tmp;
}

// TODO: when we can make fields non-nullable, we should have tests for unexecutable migrations
describe('useMigrations: false', () => {
  test('creates database and pushes schema from empty', async () => {
    await setupInitialProjectWithoutMigrations();
  });
  test('logs correctly when things are already up to date', async () => {
    const tmp = await setupInitialProjectWithoutMigrations();
    const recording = recordConsole();
    await runCommand(tmp, 'dev');

    expect(recording()).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      ⭐️ GraphQL API available at /api/graphql
      ✨ Generating GraphQL and Prisma schemas
      ✨ The database is already in sync with the Prisma schema.
      ✨ Connecting to the database
      ✨ Creating server
      ✅ GraphQL API ready"
    `);
  });
  test('warns when dropping field that has data in it', async () => {
    const prevCwd = await setupInitialProjectWithoutMigrations();
    const prismaClient = getPrismaClient(prevCwd);
    await prismaClient.todo.create({ data: { title: 'todo' } });
    await prismaClient.$disconnect();
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      ...(await getDatabaseFiles(prevCwd)),
      'keystone.js': await fs.readFile(`${__dirname}/fixtures/no-fields.ts`, 'utf8'),
    });
    const recording = recordConsole({
      'Do you want to continue? Some data will be lost.': true,
    });
    await runCommand(tmp, 'dev');

    expect(await introspectDb(tmp, dbUrl)).toMatchInlineSnapshot(`
      "datasource db {
        provider = "sqlite"
        url      = "file:./app.db"
      }

      model Todo {
        id String @id
      }
      "
    `);
    expect(recording()).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      ⭐️ GraphQL API available at /api/graphql
      ✨ Generating GraphQL and Prisma schemas

      ⚠️  Warnings:

        • You are about to drop the column \`title\` on the \`Todo\` table, which still contains 1 non-null values.
      Prompt: Do you want to continue? Some data will be lost. true
      ✨ Your database is now in sync with your schema. Done in 0ms
      ✨ Connecting to the database
      ✨ Creating server
      ✅ GraphQL API ready"
    `);
  });
  test('exits when refusing data loss prompt', async () => {
    const prevCwd = await setupInitialProjectWithoutMigrations();
    const prismaClient = getPrismaClient(prevCwd);
    await prismaClient.todo.create({ data: { title: 'todo' } });
    await prismaClient.$disconnect();
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      ...(await getDatabaseFiles(prevCwd)),
      'keystone.js': await fs.readFile(`${__dirname}/fixtures/no-fields.ts`, 'utf8'),
    });
    const recording = recordConsole({
      'Do you want to continue? Some data will be lost.': false,
    });
    await expect(runCommand(tmp, 'dev')).rejects.toEqual(new ExitError(0));

    expect(await introspectDb(tmp, dbUrl)).toMatchInlineSnapshot(`
      "datasource db {
        provider = "sqlite"
        url      = "file:./app.db"
      }

      model Todo {
        id    String @id
        title String @default("")
      }
      "
    `);
    expect(recording()).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      ⭐️ GraphQL API available at /api/graphql
      ✨ Generating GraphQL and Prisma schemas

      ⚠️  Warnings:

        • You are about to drop the column \`title\` on the \`Todo\` table, which still contains 1 non-null values.
      Prompt: Do you want to continue? Some data will be lost. false
      Push cancelled."
    `);
  });
  test('prisma db push --force-reset works', async () => {
    const tmp = await setupInitialProjectWithoutMigrations();
    {
      const prismaClient = getPrismaClient(tmp);
      await prismaClient.todo.create({ data: { title: 'something' } });
      await prismaClient.$disconnect();
    }
    const recording = recordConsole();

    await runCommand(tmp, 'prisma db push --force-reset');
    await runCommand(tmp, 'dev');
    {
      const prismaClient = getPrismaClient(tmp);
      expect(await prismaClient.todo.findMany()).toHaveLength(0);
      await prismaClient.$disconnect();
    }

    expect(recording()).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      ⭐️ GraphQL API available at /api/graphql
      ✨ Generating GraphQL and Prisma schemas
      ✨ The database is already in sync with the Prisma schema.
      ✨ Connecting to the database
      ✨ Creating server
      ✅ GraphQL API ready"
    `);
  });
});

const basicWithMigrations = fs.readFileSync(
  `${__dirname}/fixtures/one-field-with-migrations.ts`,
  'utf8'
);

async function setupInitialProjectWithMigrations() {
  const tmp = await testdir({
    ...symlinkKeystoneDeps,
    'keystone.js': basicWithMigrations,
  });
  const recording = recordConsole({
    'Name of migration': 'init',
    'Would you like to apply this migration?': true,
  });
  await runCommand(tmp, 'dev');

  expect(await introspectDb(tmp, dbUrl)).toEqual(`datasource db {
  provider = "sqlite"
  url      = "file:./app.db"
}

model Todo {
  id    String @id
  title String @default("")
}
`);

  const { migration, migrationName } = await getGeneratedMigration(tmp, 1, 'init');
  expect(migration).toEqual(`-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT ''
);
`);

  expect(cleanOutputForApplyingMigration(recording(), migrationName)).toEqual(`✨ Starting Keystone
⭐️ Server listening on :3000 (http://localhost:3000/)
⭐️ GraphQL API available at /api/graphql
✨ Generating GraphQL and Prisma schemas
✨ sqlite database "app.db" created at file:./app.db
✨ There has been a change to your Keystone schema that requires a migration

Prompt: Name of migration init
✨ A migration has been created at migrations/migration_name
Prompt: Would you like to apply this migration? true
Applying migration \`migration_name\`
✨ Connecting to the database
✨ Creating server
✅ GraphQL API ready`);
  return { migrationName, prevCwd: tmp };
}

async function getDatabaseFiles(cwd: string) {
  return getFiles(cwd, ['app.db', 'migrations/**/*'], null);
}

describe('useMigrations: true', () => {
  test('creates database, creates migration and applies from empty', async () => {
    await setupInitialProjectWithMigrations();
  });
  test('adding a field', async () => {
    const { prevCwd } = await setupInitialProjectWithMigrations();
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      ...(await getDatabaseFiles(prevCwd)),
      'keystone.js': await fs.readFile(
        `${__dirname}/fixtures/two-fields-with-migrations.ts`,
        'utf8'
      ),
    });
    const recording = recordConsole({
      'Name of migration': 'add-is-complete',
      'Would you like to apply this migration?': true,
    });
    await runCommand(tmp, 'dev');

    expect(await introspectDb(tmp, dbUrl)).toMatchInlineSnapshot(`
      "datasource db {
        provider = "sqlite"
        url      = "file:./app.db"
      }

      model Todo {
        id         String  @id
        title      String  @default("")
        isComplete Boolean @default(false)
      }
      "
    `);

    const { migration, migrationName } = await getGeneratedMigration(tmp, 2, 'add_is_complete');

    expect(migration).toMatchInlineSnapshot(`
      "-- RedefineTables
      PRAGMA foreign_keys=OFF;
      CREATE TABLE "new_Todo" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL DEFAULT '',
          "isComplete" BOOLEAN NOT NULL DEFAULT false
      );
      INSERT INTO "new_Todo" ("id", "title") SELECT "id", "title" FROM "Todo";
      DROP TABLE "Todo";
      ALTER TABLE "new_Todo" RENAME TO "Todo";
      PRAGMA foreign_key_check;
      PRAGMA foreign_keys=ON;
      "
    `);

    expect(cleanOutputForApplyingMigration(recording(), migrationName)).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      ⭐️ GraphQL API available at /api/graphql
      ✨ Generating GraphQL and Prisma schemas
      ✨ There has been a change to your Keystone schema that requires a migration

      Prompt: Name of migration add-is-complete
      ✨ A migration has been created at migrations/migration_name
      Prompt: Would you like to apply this migration? true
      Applying migration \`migration_name\`
      ✨ Connecting to the database
      ✨ Creating server
      ✅ GraphQL API ready"
    `);
  });
  test('warns when dropping field that has data in it', async () => {
    const { prevCwd } = await setupInitialProjectWithMigrations();
    const prismaClient = getPrismaClient(prevCwd);
    await prismaClient.todo.create({ data: { title: 'todo' } });
    await prismaClient.$disconnect();
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      ...(await getDatabaseFiles(prevCwd)),
      'keystone.js': await fs.readFile(
        `${__dirname}/fixtures/no-fields-with-migrations.ts`,
        'utf8'
      ),
    });
    const recording = recordConsole({
      'Name of migration': 'remove all fields except id',
      'Would you like to apply this migration?': true,
    });
    await runCommand(tmp, 'dev');

    expect(await introspectDb(tmp, dbUrl)).toMatchInlineSnapshot(`
      "datasource db {
        provider = "sqlite"
        url      = "file:./app.db"
      }

      model Todo {
        id String @id
      }
      "
    `);

    const { migration, migrationName } = await getGeneratedMigration(
      tmp,
      2,
      'remove_all_fields_except_id'
    );

    expect(migration).toMatchInlineSnapshot(`
      "/*
        Warnings:

        - You are about to drop the column \`title\` on the \`Todo\` table. All the data in the column will be lost.

      */
      -- RedefineTables
      PRAGMA foreign_keys=OFF;
      CREATE TABLE "new_Todo" (
          "id" TEXT NOT NULL PRIMARY KEY
      );
      INSERT INTO "new_Todo" ("id") SELECT "id" FROM "Todo";
      DROP TABLE "Todo";
      ALTER TABLE "new_Todo" RENAME TO "Todo";
      PRAGMA foreign_key_check;
      PRAGMA foreign_keys=ON;
      "
    `);

    expect(cleanOutputForApplyingMigration(recording(), migrationName)).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      ⭐️ GraphQL API available at /api/graphql
      ✨ Generating GraphQL and Prisma schemas
      ✨ There has been a change to your Keystone schema that requires a migration

      ⚠️  Warnings:

        • You are about to drop the column \`title\` on the \`Todo\` table, which still contains 1 non-null values.

      Prompt: Name of migration remove all fields except id
      ✨ A migration has been created at migrations/migration_name
      Prompt: Would you like to apply this migration? true
      Applying migration \`migration_name\`
      ✨ Connecting to the database
      ✨ Creating server
      ✅ GraphQL API ready"
    `);
  });
  test('prompts to drop database when database is out of sync with migrations directory', async () => {
    const { migrationName: oldMigrationName, prevCwd } = await setupInitialProjectWithMigrations();
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      'app.db': await fs.readFile(`${prevCwd}/app.db`),
      'keystone.js': await fs.readFile(`${__dirname}/fixtures/one-field-with-migrations.ts`),
    });
    const recording = recordConsole({
      'Do you want to continue? All data will be lost.': true,
      'Name of migration': 'init',
      'Would you like to apply this migration?': true,
    });
    await runCommand(tmp, 'dev');

    expect(await introspectDb(tmp, dbUrl)).toMatchInlineSnapshot(`
      "datasource db {
        provider = "sqlite"
        url      = "file:./app.db"
      }

      model Todo {
        id    String @id
        title String @default("")
      }
      "
    `);

    const { migration, migrationName } = await getGeneratedMigration(tmp, 1, 'init');

    expect(migration).toMatchInlineSnapshot(`
      "-- CreateTable
      CREATE TABLE "Todo" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL DEFAULT ''
      );
      "
    `);

    expect(
      cleanOutputForApplyingMigration(recording(), migrationName).replace(
        oldMigrationName,
        'old_migration_name'
      )
    ).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      ⭐️ GraphQL API available at /api/graphql
      ✨ Generating GraphQL and Prisma schemas
      - Drift detected: Your database schema is not in sync with your migration history.

      The following is a summary of the differences between the expected database schema given your migrations files, and the actual schema of the database.

      It should be understood as the set of changes to get from the expected schema to the actual schema.

      [+] Added tables
        - Todo

      - The following migration(s) are applied to the database but missing from the local migrations directory: old_migration_name


      We need to reset the sqlite database "app.db" at file:./app.db.
      Prompt: Do you want to continue? All data will be lost. true

      ✨ There has been a change to your Keystone schema that requires a migration

      Prompt: Name of migration init
      ✨ A migration has been created at migrations/migration_name
      Prompt: Would you like to apply this migration? true
      Applying migration \`migration_name\`
      ✨ Connecting to the database
      ✨ Creating server
      ✅ GraphQL API ready"
    `);
  });
  test("doesn't drop when prompt denied", async () => {
    const { migrationName: oldMigrationName, prevCwd } = await setupInitialProjectWithMigrations();
    const dbBuffer = await fs.readFile(`${prevCwd}/app.db`);
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      'app.db': dbBuffer,
      'keystone.js': await fs.readFile(`${__dirname}/fixtures/no-fields-with-migrations.ts`),
    });
    const recording = recordConsole({
      'Do you want to continue? All data will be lost.': false,
    });

    await expect(runCommand(tmp, 'dev')).rejects.toEqual(new ExitError(0));

    expect(await fs.readFile(`${prevCwd}/app.db`)).toEqual(dbBuffer);

    expect(recording().replace(oldMigrationName, 'old_migration_name')).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      ⭐️ GraphQL API available at /api/graphql
      ✨ Generating GraphQL and Prisma schemas
      - Drift detected: Your database schema is not in sync with your migration history.

      The following is a summary of the differences between the expected database schema given your migrations files, and the actual schema of the database.

      It should be understood as the set of changes to get from the expected schema to the actual schema.

      [+] Added tables
        - Todo

      - The following migration(s) are applied to the database but missing from the local migrations directory: old_migration_name


      We need to reset the sqlite database "app.db" at file:./app.db.
      Prompt: Do you want to continue? All data will be lost. false

      Reset cancelled."
    `);
  });
  test('create migration but do not apply', async () => {
    const { prevCwd } = await setupInitialProjectWithMigrations();
    const dbFiles = await getDatabaseFiles(prevCwd);
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      ...dbFiles,
      'keystone.js': await fs.readFile(`${__dirname}/fixtures/two-fields-with-migrations.ts`),
    });
    const recording = recordConsole({
      'Name of migration': 'add-is-complete',
      'Would you like to apply this migration?': false,
    });
    await expect(runCommand(tmp, 'dev')).rejects.toEqual(new ExitError(0));

    expect(await introspectDb(tmp, dbUrl)).toMatchInlineSnapshot(`
      "datasource db {
        provider = "sqlite"
        url      = "file:./app.db"
      }

      model Todo {
        id    String @id
        title String @default("")
      }
      "
    `);

    expect(await fs.readFile(`${prevCwd}/app.db`)).toEqual(dbFiles['app.db']);

    const migrationName = (await fs.readdir(`${tmp}/migrations`)).find(x =>
      x.endsWith('_add_is_complete')
    );
    expect(await fs.readFile(`${tmp}/migrations/${migrationName}/migration.sql`, 'utf8'))
      .toMatchInlineSnapshot(`
      "-- RedefineTables
      PRAGMA foreign_keys=OFF;
      CREATE TABLE "new_Todo" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL DEFAULT '',
          "isComplete" BOOLEAN NOT NULL DEFAULT false
      );
      INSERT INTO "new_Todo" ("id", "title") SELECT "id", "title" FROM "Todo";
      DROP TABLE "Todo";
      ALTER TABLE "new_Todo" RENAME TO "Todo";
      PRAGMA foreign_key_check;
      PRAGMA foreign_keys=ON;
      "
    `);

    expect(recording().replace(migrationName!, 'migration_name')).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      ⭐️ GraphQL API available at /api/graphql
      ✨ Generating GraphQL and Prisma schemas
      ✨ There has been a change to your Keystone schema that requires a migration

      Prompt: Name of migration add-is-complete
      ✨ A migration has been created at migrations/migration_name
      Prompt: Would you like to apply this migration? false
      Please edit the migration and run keystone dev again to apply the migration"
    `);
  });
  test('apply already existing migrations', async () => {
    const { prevCwd } = await setupInitialProjectWithMigrations();
    const { 'app.db': _ignore, ...migrations } = await getDatabaseFiles(prevCwd);
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      ...migrations,
      'keystone.js': basicWithMigrations,
    });
    const recording = recordConsole();
    await runCommand(tmp, 'dev');

    expect(await introspectDb(tmp, dbUrl)).toMatchInlineSnapshot(`
      "datasource db {
        provider = "sqlite"
        url      = "file:./app.db"
      }

      model Todo {
        id    String @id
        title String @default("")
      }
      "
    `);

    const { migrationName } = await getGeneratedMigration(tmp, 1, 'init');

    expect(recording().replace(new RegExp(migrationName, 'g'), 'migration_name'))
      .toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      ⭐️ GraphQL API available at /api/graphql
      ✨ Generating GraphQL and Prisma schemas
      ✨ sqlite database "app.db" created at file:./app.db
      Applying migration \`migration_name\`
      ✨ The following migration(s) have been applied:

      migrations/
        └─ migration_name/
          └─ migration.sql
      ✨ Your migrations are up to date, no new migrations need to be created
      ✨ Connecting to the database
      ✨ Creating server
      ✅ GraphQL API ready"
    `);
  });
  test('logs correctly when no migrations need to be created or applied', async () => {
    const { prevCwd } = await setupInitialProjectWithMigrations();
    const recording = recordConsole();
    await runCommand(prevCwd, 'dev');

    expect(recording()).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      ⭐️ GraphQL API available at /api/graphql
      ✨ Generating GraphQL and Prisma schemas
      ✨ Your database is up to date, no migrations need to be created or applied
      ✨ Connecting to the database
      ✨ Creating server
      ✅ GraphQL API ready"
    `);
  });
});

describe('start --with-migrations', () => {
  async function startAndStopServer(tmp: string) {
    const startResult = execa('node', [cliBinPath, 'start', '--no-ui', '--with-migrations'], {
      reject: false,
      all: true,
      cwd: tmp,
    });

    let output = '';
    try {
      await Promise.race([
        new Promise((resolve, reject) =>
          setTimeout(() => reject(new Error(`timed out. output:\n${output}`)), 10000)
        ),
        new Promise<void>(resolve => {
          startResult.all!.on('data', data => {
            output += data;
            if (output.includes('Server listening on :3000 (http://localhost:3000/)')) {
              resolve();
            }
          });
        }),
      ]);
    } finally {
      startResult.kill();
    }
    return output;
  }
  test('apply existing migrations', async () => {
    const { prevCwd } = await setupInitialProjectWithMigrations();
    const { 'app.db': _ignore, ...migrations } = await getDatabaseFiles(prevCwd);
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      ...migrations,
      'keystone.js': basicWithMigrations,
    });

    await runCommand(tmp, 'build --no-ui');
    const output = await startAndStopServer(tmp);
    expect(await introspectDb(tmp, dbUrl)).toMatchInlineSnapshot(`
      "datasource db {
        provider = "sqlite"
        url      = "file:./app.db"
      }

      model Todo {
        id    String @id
        title String @default("")
      }
      "
    `);

    const { migrationName } = await getGeneratedMigration(tmp, 1, 'init');

    expect(
      output.replace(new RegExp(migrationName, 'g'), 'migration_name').replace(/\d+ms/g, '0ms')
    ).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ✨ Connecting to the database
      ✨ Applying database migrations
      Applying migration \`migration_name\`
      ✨ Your database is now in sync with your Generated Migrations. Done in 0ms
      ✨ Creating server
      ✅ GraphQL API ready
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      "
    `);
  });
  test('logs correctly when no migrations need applied', async () => {
    const { prevCwd } = await setupInitialProjectWithMigrations();
    await runCommand(prevCwd, 'build --no-ui');
    const output = await startAndStopServer(prevCwd);

    expect(output).toMatchInlineSnapshot(`
      "✨ Starting Keystone
      ✨ Connecting to the database
      ✨ Applying database migrations
      ✨ The database is already in sync with your Generated Migrations.
      ✨ Creating server
      ✅ GraphQL API ready
      ⭐️ Server listening on :3000 (http://localhost:3000/)
      "
    `);
  });
});
