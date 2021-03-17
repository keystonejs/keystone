import path from 'path';
import { createDatabase, uriToCredentials, DatabaseCredentials } from '@prisma/sdk';
import { Migrate } from '@prisma/migrate';

// we don't want to pollute process.env.DATABASE_URL so we're
// setting the env variable _just_ long enough for Migrate to
// read it and then we reset it immediately after.
// Migrate reads the env variables a single time when it starts the child process that it talks to
function runMigrateWithDbUrl<T>(dbUrl: string, cb: () => T): T {
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

  let migration = await runMigrateWithDbUrl(dbUrl, () =>
    migrate.engine.schemaPush({
      // TODO: we probably want to do something like db push does where either there's
      // a prompt or an argument needs to be passed to make it force(i.e. lose data)
      force: true,
      schema,
    })
  );
  migrate.stop();

  if (migration.warnings.length === 0 && migration.executedSteps === 0) {
    console.info(`✨ The database is already in sync with the Prisma schema.`);
  } else {
    console.info(
      `✨ Your database is now in sync with your schema. Done in ${formatms(Date.now() - before)}`
    );
  }
}

async function ensureDatabaseExists(dbUrl: string, schemaDir: string) {
  // createDatabase will return false when the database already exists
  const result = await createDatabase(dbUrl, schemaDir);
  if (result && result.exitCode === 0) {
    const credentials = uriToCredentials(dbUrl);
    console.log(
      `✨ ${credentials.type} database "${credentials.database}" created at ${getDbLocation(
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

function formatms(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  return (ms / 1000).toFixed(2) + 's';
}
