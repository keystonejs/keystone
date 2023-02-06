import meow from 'meow';
import { ExitError } from './utils';
import { build } from './build/build';
import { dev } from './run/dev';
import { migrate } from './migrate';
import { prisma } from './prisma';
import { start } from './run/start';
import { telemetry } from './telemetry';

export type Flags = {
  dbPush: boolean;
  fix?: boolean; // TODO: remove
  frozen: boolean;
  prisma: boolean;
  resetDb: boolean;
  server: boolean;
  ui: boolean;
  withMigrations: boolean;
};

export async function cli(cwd: string, argv: string[]) {
  const { input, help, flags } = meow(
    `
    Usage
      $ keystone [command] [options]
    Commands
        dev           start the project in development mode (default)
        postinstall   build the project (for development, optional)
        build         build the project (required by \`keystone start\`)
        start         start the project
        migrate       setup and run database migrations
        prisma        run Prisma CLI commands safely
        telemetry     sets telemetry preference (enable/disable/status)

    Options
      --fix (postinstall) @deprecated
        do build the graphql or prisma schemas, don't validate them

      --frozen (build)
        don't build the graphql or prisma schemas, only validate them

      --no-db-push (dev)
        don't push non-destructive updates of your Prisma schema to your database

      --no-prisma (build, dev)
        don't build or validate the prisma schema

      --no-server (dev)
        don't start the express server

      --no-ui (build, dev, start)
        don't build and serve the AdminUI

      --with-migrations (start)
        trigger prisma to run migrations as part of startup
    `,
    {
      allowUnknownFlags: false,
      flags: {
        dbPush: { default: true, type: 'boolean' },
        frozen: { default: false, type: 'boolean' },
        prisma: { default: true, type: 'boolean' },
        resetDb: { default: false, type: 'boolean' },
        server: { default: true, type: 'boolean' },
        ui: { default: true, type: 'boolean' },
        withMigrations: { default: false, type: 'boolean' },
        fix: { default: false, type: 'boolean' },
      },
      argv,
    }
  );

  const command = input[0] || 'dev';
  if (command === 'dev') return dev(cwd, flags);
  if (command === 'build') return build(cwd, flags);
  if (command === 'start') return start(cwd, flags);
  if (command === 'migrate') return migrate(cwd, input, flags.resetDb);
  if (command === 'prisma') return prisma(cwd, argv.slice(1));
  if (command === 'telemetry') return telemetry(cwd, argv[1]);

  // WARNING: postinstall is an alias for `build --no-ui`
  if (command === 'postinstall') {
    flags.ui = false;
    flags.frozen = !flags.fix;
    return build(cwd, flags);
  }

  console.log(`${command} is an unknown command`);
  console.log(help);
  throw new ExitError(1);
}
