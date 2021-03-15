import { createDatabase, uriToCredentials, DatabaseCredentials } from '@prisma/sdk';
import { Migrate } from '@prisma/migrate';
import chalk from 'chalk';
import prompt from 'prompts';

// we don't want to pollute process.env.DATABASE_URL so we're
// setting the env variable _just_ long enough for Migrate to
// read it and then we reset it immediately after.
// Migrate reads the env variables a single time when it starts the child process that it talks to

// note that we could only run this once per Migrate instance but we're going to do it consistently for all migrate calls
// so that calls can moved around freely without implictly relying on some other migrate command being called before it
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

  await ensureDatabaseExists(dbUrl);
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

export async function devMigrations(dbUrl: string, schema: string, schemaPath: string) {
  await ensureDatabaseExists(dbUrl);
  let migrate = new Migrate(schemaPath);
  const migrationIdsApplied: string[] = [];
  let { appliedMigrationNames } = await runMigrateWithDbUrl(dbUrl, () => migrate.applyMigrations());
  migrationIdsApplied.push(...appliedMigrationNames);
  // Inform user about applied migrations now
  if (appliedMigrationNames.length > 0) {
    console.info(
      `The following migration(s) have been applied:\n\n${printFilesFromMigrationIds(
        'migrations',
        appliedMigrationNames,
        { 'migration.sql': '' }
      )}`
    );
  }
  const evaluateDataLossResult = await runMigrateWithDbUrl(dbUrl, () => migrate.evaluateDataLoss());

  if (evaluateDataLossResult.unexecutableSteps) {
    console.log(`${chalk.bold.red('\n⚠️ We found changes that cannot be executed:\n')}`);
    for (const item of evaluateDataLossResult.unexecutableSteps) {
      console.log(`  • Step ${item.stepIndex} ${item.message}`);
    }
  }
  if (evaluateDataLossResult.warnings.length) {
    console.log(chalk.bold(`\n⚠️  There will be data loss when applying the migration:\n`));
    for (const warning of evaluateDataLossResult.warnings) {
      console.log(chalk(`  • ${warning.message}`));
    }
    const confirmation = await prompt({
      type: 'confirm',
      name: 'value',
      message: `Are you sure you want create this migration? ${chalk.red(
        'Some data will be lost'
      )}.`,
    });
  }
}

function printFilesFromMigrationIds(
  directory: string,
  migrationIds: string[],
  files: Record<string, string>
): string {
  const fileNames = Object.keys(files);

  let message = `\
${directory}/`;

  migrationIds.forEach(migrationId => {
    message += `\n  └─ ${printMigrationId(migrationId)}/
${indent(fileNames.map(f => `└─ ${f}`).join('\n'), 4)}`;
  });

  return message;
}

async function ensureDatabaseExists(dbUrl: string) {
  // createDatabase will return false when the database already exists
  const result = await createDatabase(dbUrl);
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
