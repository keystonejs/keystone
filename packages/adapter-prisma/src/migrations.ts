import { createDatabase, uriToCredentials, DatabaseCredentials } from '@prisma/sdk';
import { Migrate } from '@prisma/migrate';
import path from 'path';

export async function runMigrations(
  migrationMode: 'createOnly' | 'dev' | 'prototype',
  dbUrl: string,
  schema: string,
  schemaPath: string
) {
  if (migrationMode === 'prototype') {
    await runPrototypeMigrations(dbUrl, schema, schemaPath);
  } else if (migrationMode === 'dev') {
  }
}

// what we're doing here is setting the DB url on process.env.DATABASE_URL
// and then resetting it after so that we're not polluting process.env.DATABASE_URL
// Migrate reads the env variables a single time when it starts the child process that it talks to
// so we're setting the env variable _just_ long enough for Migrate to read it and then we reset it immediately after
function runMigrateWithDbURL<T>(dbUrl: string, cb: () => T): T {
  let prevDBURLFromEnv = process.env.DATABASE_URL;
  try {
    process.env.DATABASE_URL = dbUrl;
    return cb();
  } finally {
    process.env.DATABASE_URL = prevDBURLFromEnv;
  }
}

export async function runPrototypeMigrations(dbUrl: string, schema: string, schemaPath: string) {
  let before = Date.now();

  await ensureDatabaseExists(dbUrl, path.dirname(schemaPath));
  let migrate = new Migrate(schemaPath);

  let migration = await runMigrateWithDbURL(dbUrl, () =>
    migrate.engine.schemaPush({
      // TODO: we probably want to do something like db push does where either there's
      // a prompt or an argument needs to be passed to make it force(i.e. lose data)
      force: true,
      schema,
    })
  );
  migrate.stop();

  if (migration.warnings.length === 0 && migration.executedSteps === 0) {
    console.info(`\nThe database is already in sync with the Prisma schema.`);
  } else {
    console.info(
      `\n${
        process.platform === 'win32' ? '' : '🚀  '
      }Your database is now in sync with your schema. Done in ${formatms(Date.now() - before)}`
    );
  }
}

export async function createDevMigration(dbUrl: string, schemaPath: string) {
  await ensureDatabaseExists(dbUrl, path.dirname(schemaPath));
}

async function ensureDatabaseExists(dbUrl: string, schemaDir: string) {
  // createDatabase will return false when the database already exists
  const result = await createDatabase(dbUrl, schemaDir);
  if (result && result.exitCode === 0) {
    const credentials = uriToCredentials(dbUrl);
    console.log(
      `${credentials.type} database ${credentials.database} created at ${getDbLocation(
        credentials
      )}`
    );
  }
  // TODO: handle createDatabase returning a failure (prisma's cli does not handle it though so not super worried)
}

function getDbLocation(credentials: DatabaseCredentials): string {
  if (credentials.type === 'sqlite') {
    return credentials.uri!;
  }

  return `${credentials.host}${credentials.port === undefined ? '' : `:${credentials.port}`}`;
}

export function formatms(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  return (ms / 1000).toFixed(2) + 's';
}
