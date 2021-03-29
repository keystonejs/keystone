import path from 'path';
import { createDatabase, uriToCredentials, DatabaseCredentials } from '@prisma/sdk';
import { Migrate } from '@prisma/migrate';
import chalk from 'chalk';
import slugify from '@sindresorhus/slugify';
import { confirmPrompt, textPrompt } from './prompts';

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

async function withMigrate<T>(
  dbUrl: string,
  schemaPath: string,
  cb: (migrate: Migrate) => Promise<T>
) {
  await ensureDatabaseExists(dbUrl, path.dirname(schemaPath));
  const migrate = new Migrate(schemaPath);

  try {
    return await cb(migrate);
  } finally {
    migrate.stop();
  }
}

export async function runPrototypeMigrations(dbUrl: string, schema: string, schemaPath: string) {
  let before = Date.now();

  let migration = await withMigrate(dbUrl, schemaPath, async migrate =>
    runMigrateWithDbUrl(dbUrl, () =>
      migrate.engine.schemaPush({
        // TODO: we probably want to do something like db push does where either there's
        // a prompt or an argument needs to be passed to make it force(i.e. lose data)
        force: true,
        schema,
      })
    )
  );

  if (migration.warnings.length === 0 && migration.executedSteps === 0) {
    console.info(`✨ The database is already in sync with the Prisma schema.`);
  } else {
    console.info(
      `✨ Your database is now in sync with your schema. Done in ${formatms(Date.now() - before)}`
    );
  }
}

// https://github.com/prisma/prisma/blob/527b6bd35e7fe4dbe854653f872a07b25febeb65/src/packages/migrate/src/commands/MigrateDeploy.ts
export async function deployMigrations(dbUrl: string, schemaPath: string) {
  return withMigrate(dbUrl, schemaPath, async migrate => {
    const diagnoseResult = await runMigrateWithDbUrl(dbUrl, () =>
      migrate.diagnoseMigrationHistory({
        optInToShadowDatabase: false,
      })
    );
    const listMigrationDirectoriesResult = await runMigrateWithDbUrl(dbUrl, () =>
      migrate.listMigrationDirectories()
    );

    console.info(); // empty line
    if (listMigrationDirectoriesResult.migrations.length > 0) {
      const migrations = listMigrationDirectoriesResult.migrations;
      console.info(
        `${migrations.length} migration${
          migrations.length > 1 ? 's' : ''
        } found in .keystone/prisma/migrations`
      );
    } else {
      console.info(`No migration found in .keystone/prisma/migrations`);
    }

    const editedMigrationNames = diagnoseResult.editedMigrationNames;
    if (editedMigrationNames.length > 0) {
      console.info(
        `${chalk.yellow(
          'WARNING The following migrations have been modified since they were applied:'
        )}
${editedMigrationNames.join('\n')}`
      );
    }

    const { appliedMigrationNames: migrationIds } = await runMigrateWithDbUrl(dbUrl, () =>
      migrate.applyMigrations()
    );

    console.info(); // empty line
    if (migrationIds.length === 0) {
      console.log(chalk.greenBright(`No pending migrations to apply.`));
    } else {
      console.log(`The following migration${
        migrationIds.length > 1 ? 's' : ''
      } have been applied:\n\n${printFilesFromMigrationIds(migrationIds)}

${chalk.greenBright('All migrations have been successfully applied.')}`);
    }
  });
}

// https://github.com/prisma/prisma/blob/527b6bd35e7fe4dbe854653f872a07b25febeb65/src/packages/migrate/src/commands/MigrateReset.ts
export async function resetDatabaseWithMigrations(dbUrl: string, schemaPath: string) {
  return withMigrate(dbUrl, schemaPath, async migrate => {
    await runMigrateWithDbUrl(dbUrl, () => migrate.reset());

    const { appliedMigrationNames: migrationIds } = await runMigrateWithDbUrl(dbUrl, () =>
      migrate.applyMigrations()
    );

    console.log(`${chalk.green('Database reset successful')}`);

    if (migrationIds.length) {
      console.info(
        `\nThe following migration(s) have been applied:\n\n${printFilesFromMigrationIds(
          migrationIds
        )}`
      );
    }
  });
}

export type CLIOptionsForCreateMigration = {
  allowEmpty: boolean;
  acceptDataLoss: boolean;
  name: string | undefined;
};

// TODO: don't have process.exit calls here
export async function createMigration(
  dbUrl: string,
  prismaSchema: string,
  schemaPath: string,
  cliOptions: CLIOptionsForCreateMigration
) {
  return withMigrate(dbUrl, schemaPath, async migrate => {
    // see if we need to reset the database
    // note that the other action devDiagnostic can return is createMigration
    // that doesn't necessarily mean that we need to create a migration
    // it only means that we don't need to reset the database
    const devDiagnostic = await runMigrateWithDbUrl(dbUrl, () => migrate.devDiagnostic());
    // when the action is reset, the database is somehow inconsistent with the migrations so we need to reset it
    // (not just some migrations need to be applied but there's some inconsistency)
    if (devDiagnostic.action.tag === 'reset') {
      const credentials = uriToCredentials(dbUrl);
      if (cliOptions.acceptDataLoss === false) {
        console.log(`${devDiagnostic.action.reason}

        We need to reset the ${credentials.type} database "${
          credentials.database
        }" at ${getDbLocation(credentials)}.`);

        if (!process.stdout.isTTY) {
          console.log(
            "We've detected that you're in a non-interactive environment so you need to pass --accept-data-loss to reset the database"
          );
          process.exit(1);
        }
        const confirmedReset = await confirmPrompt(
          `Do you want to continue? ${chalk.red('All data will be lost')}.`
        );
        console.info(); // empty line

        if (!confirmedReset) {
          console.info('Reset cancelled.');
          process.exit(0);
        }
      }

      // Do the reset
      await migrate.reset();
    }

    let { appliedMigrationNames } = await runMigrateWithDbUrl(dbUrl, () =>
      migrate.applyMigrations()
    );
    // Inform user about applied migrations now
    if (appliedMigrationNames.length) {
      console.info(
        `✨ The following migration(s) have been applied:\n\n${printFilesFromMigrationIds(
          appliedMigrationNames
        )}`
      );
    }
    // evaluateDataLoss basically means "try to create a migration but don't write it"
    // so we can tell the user whether it can be executed and if there will be data loss
    const evaluateDataLossResult = await runMigrateWithDbUrl(dbUrl, () =>
      migrate.evaluateDataLoss()
    );

    // there are no steps to the migration so we need to make sure the user wants to create an empty migration
    if (!evaluateDataLossResult.migrationSteps.length && cliOptions.allowEmpty === false) {
      console.log('There have been no changes to your schema that require a migration');
      if (process.stdout.isTTY) {
        if (!(await confirmPrompt('Are you sure that you want to create an empty migration?'))) {
          process.exit(0);
        }
      } else {
        console.log(
          "We've detected that you're in a non-interactive environment so you need to pass --allow-empty to create an empty migration"
        );
        // note this is a failure even though the migrations are up to date
        // since the user said "i want to create a migration" and we've said no
        process.exit(1);
      }
    }

    let migrationCanBeApplied = !evaluateDataLossResult.unexecutableSteps.length;
    // see the link below for what "unexecutable steps" are
    // https://github.com/prisma/prisma-engines/blob/c65d20050f139a7917ef2efc47a977338070ea61/migration-engine/connectors/sql-migration-connector/src/sql_destructive_change_checker/unexecutable_step_check.rs
    // the tl;dr is "making things non null when there are nulls in the db"
    if (!migrationCanBeApplied) {
      console.log(`${chalk.bold.red('\n⚠️ We found changes that cannot be executed:\n')}`);
      for (const item of evaluateDataLossResult.unexecutableSteps) {
        console.log(`  • Step ${item.stepIndex} ${item.message}`);
      }
    }
    // warnings mean "if the migration was applied to the database you're connected to, you will lose x data"
    // note that if you have a field where all of the values are null on your local db and you've removed it, you won't get a warning here.
    // there will be a warning in a comment in the generated migration though.
    if (evaluateDataLossResult.warnings.length) {
      console.log(chalk.bold(`\n⚠️  Warnings:\n`));
      for (const warning of evaluateDataLossResult.warnings) {
        console.log(`  • ${warning.message}`);
      }
    }

    console.log(); // for an empty line

    let migrationName = await (() => {
      if (cliOptions.name) {
        return cliOptions.name;
      }
      if (process.stdout.isTTY) {
        return getMigrationName();
      }
      console.log(
        "We've detected that you're in a non-interactive environment so you need to pass --name to provide a migration name"
      );
      process.exit(1);
    })();

    // note this only creates the migration, it does not apply it
    let { generatedMigrationName } = await runMigrateWithDbUrl(dbUrl, () =>
      migrate.createMigration({
        migrationsDirectoryPath: migrate.migrationsDirectoryPath,
        // https://github.com/prisma/prisma-engines/blob/11dfcc85d7f9b55235e31630cd87da7da3aed8cc/migration-engine/core/src/commands/create_migration.rs#L16-L17
        // draft means "create an empty migration even if there are no changes rather than exiting"
        draft: true,
        prismaSchema,
        migrationName,
      })
    );

    console.log(
      `✨ A migration has been created at .keystone/prisma/migrations/${generatedMigrationName}`
    );
  });
}

// TODO: don't have process.exit calls here
export async function devMigrations(dbUrl: string, prismaSchema: string, schemaPath: string) {
  return withMigrate(dbUrl, schemaPath, async migrate => {
    // see if we need to reset the database
    // note that the other action devDiagnostic can return is createMigration
    // that doesn't necessarily mean that we need to create a migration
    // it only means that we don't need to reset the database
    const devDiagnostic = await runMigrateWithDbUrl(dbUrl, () => migrate.devDiagnostic());
    // when the action is reset, the database is somehow inconsistent with the migrations so we need to reset it
    // (not just some migrations need to be applied but there's some inconsistency)
    if (devDiagnostic.action.tag === 'reset') {
      const credentials = uriToCredentials(dbUrl);
      console.log(`${devDiagnostic.action.reason}

We need to reset the ${credentials.type} database "${credentials.database}" at ${getDbLocation(
        credentials
      )}.`);
      const confirmedReset = await confirmPrompt(
        `Do you want to continue? ${chalk.red('All data will be lost')}.`
      );
      console.info(); // empty line

      if (!confirmedReset) {
        console.info('Reset cancelled.');
        process.exit(0);
      }

      // Do the reset
      await migrate.reset();
    }

    let { appliedMigrationNames } = await runMigrateWithDbUrl(dbUrl, () =>
      migrate.applyMigrations()
    );
    // Inform user about applied migrations now
    if (appliedMigrationNames.length) {
      console.info(
        `✨ The following migration(s) have been applied:\n\n${printFilesFromMigrationIds(
          appliedMigrationNames
        )}`
      );
    }
    // evaluateDataLoss basically means "try to create a migration but don't write it"
    // so we can tell the user whether it can be executed and if there will be data loss
    const evaluateDataLossResult = await runMigrateWithDbUrl(dbUrl, () =>
      migrate.evaluateDataLoss()
    );
    // if there are no steps, there was no change to the prisma schema so we don't need to create a migration
    if (evaluateDataLossResult.migrationSteps.length) {
      console.log('✨ There has been a change to your Keystone schema that requires a migration');
      let migrationCanBeApplied = !evaluateDataLossResult.unexecutableSteps.length;
      // see the link below for what "unexecutable steps" are
      // https://github.com/prisma/prisma-engines/blob/c65d20050f139a7917ef2efc47a977338070ea61/migration-engine/connectors/sql-migration-connector/src/sql_destructive_change_checker/unexecutable_step_check.rs
      // the tl;dr is "making things non null when there are nulls in the db"
      if (!migrationCanBeApplied) {
        console.log(`${chalk.bold.red('\n⚠️ We found changes that cannot be executed:\n')}`);
        for (const item of evaluateDataLossResult.unexecutableSteps) {
          console.log(`  • Step ${item.stepIndex} ${item.message}`);
        }
      }
      // warnings mean "if the migration was applied to the database you're connected to, you will lose x data"
      // note that if you have a field where all of the values are null on your local db and you've removed it, you won't get a warning here.
      // there will be a warning in a comment in the generated migration though.
      if (evaluateDataLossResult.warnings.length) {
        console.log(chalk.bold(`\n⚠️  Warnings:\n`));
        for (const warning of evaluateDataLossResult.warnings) {
          console.log(`  • ${warning.message}`);
        }
      }

      console.log(); // for an empty line

      let migrationName = await getMigrationName();

      // note this only creates the migration, it does not apply it
      let { generatedMigrationName } = await runMigrateWithDbUrl(dbUrl, () =>
        migrate.createMigration({
          migrationsDirectoryPath: migrate.migrationsDirectoryPath,
          // https://github.com/prisma/prisma-engines/blob/11dfcc85d7f9b55235e31630cd87da7da3aed8cc/migration-engine/core/src/commands/create_migration.rs#L16-L17
          // draft means "create an empty migration even if there are no changes rather than exiting"
          // because this whole thing only happens when there are changes to the schema, this can be false
          // (we should also ofc have a way to create an empty migration but that's a separate thing)
          draft: false,
          prismaSchema,
          migrationName,
        })
      );

      console.log(
        `✨ A migration has been created at .keystone/prisma/migrations/${generatedMigrationName}`
      );

      let shouldApplyMigration =
        migrationCanBeApplied && (await confirmPrompt('Would you like to apply this migration?'));
      if (shouldApplyMigration) {
        await runMigrateWithDbUrl(dbUrl, () => migrate.applyMigrations());
        console.log('✅ The migration has been applied');
      } else {
        console.log(
          'Please edit the migration and run keystone-next dev again to apply the migration'
        );
        process.exit(0);
      }
    } else {
      if (appliedMigrationNames.length) {
        console.log('✨ Your migrations are up to date, no new migrations need to be created');
      } else {
        console.log('✨ Your database is up to date, no migrations need to be created or applied');
      }
    }
  });
}

// based on https://github.com/prisma/prisma/blob/3fed5919545bfae0a82d35134a4f1d21359118cb/src/packages/migrate/src/utils/promptForMigrationName.ts
const MAX_MIGRATION_NAME_LENGTH = 200;
async function getMigrationName() {
  let migrationName = await textPrompt('Name of migration');
  return slugify(migrationName, { separator: '_' }).substring(0, MAX_MIGRATION_NAME_LENGTH);
}

function printFilesFromMigrationIds(migrationIds: string[]) {
  return `.keystone/prisma/migrations/\n${migrationIds
    .map(migrationId => `  └─ ${printMigrationId(migrationId)}/\n    └─ migration.sql`)
    .join('\n')}`;
}

function printMigrationId(migrationId: string): string {
  const words = migrationId.split('_');
  if (words.length === 1) {
    return chalk.cyan.bold(migrationId);
  }
  return `${words[0]}_${chalk.cyan.bold(words.slice(1).join('_'))}`;
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
