import meow from 'meow';
import { ExitError } from './utils';
import { build } from './build/build';
import { dev } from './run/dev';
import { prisma } from './prisma';
import { start } from './run/start';
import { telemetry } from './telemetry';

export type Flags = {
  dbPush: boolean;
  fix: boolean; // TODO: remove, deprecated
  frozen: boolean;
  prisma: boolean;
  resetDb: boolean;
  server: boolean;
  ui: boolean;
  withMigrations: boolean;
};

function defaultFlags(flags: Partial<Flags>, defaults: Partial<Flags>) {
  flags = { ...defaults, ...flags };

  for (const [key, value] of Object.entries(flags)) {
    if (value !== undefined && !(key in defaults)) {
      throw new Error(`Option '${key}' is unsupported for this command`);
    }

    const defaultValue = defaults[key as keyof Flags];
    // should we default the flag?
    if (value === undefined) {
      flags[key as keyof Flags] = defaultValue;
    }

    if (typeof value !== typeof defaultValue) {
      throw new Error(`Option '${key}' should be of type ${typeof defaultValue}`);
    }
  }
  return flags as Flags;
}

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
        prisma        run Prisma CLI commands safely
        telemetry     sets telemetry preference (enable/disable/status)

    Options
      --fix (postinstall) @deprecated
        do build the graphql or prisma schemas, don't validate them

      --frozen (build, prisma)
        don't build the graphql or prisma schemas, only validate them

      --no-db-push (dev)
        don't push any updates of your Prisma schema to your database

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
      argv,
    }
  );

  const command = input[0] || 'dev';
  if (command === 'dev') {
    return dev(
      cwd,
      defaultFlags(flags, { dbPush: true, prisma: true, resetDb: false, server: true, ui: true })
    );
  }

  if (command === 'build') {
    return build(cwd, defaultFlags(flags, { frozen: false, prisma: true, ui: true }));
  }

  if (command === 'start') {
    return start(cwd, defaultFlags(flags, { ui: true, withMigrations: false }));
  }

  if (command === 'prisma') {
    return prisma(cwd, argv.slice(1), defaultFlags(flags, { frozen: false }).frozen);
  }

  if (command === 'telemetry') return telemetry(cwd, argv[1]);

  // WARNING: postinstall is an alias for `build --frozen --no-ui`
  if (command === 'postinstall') {
    return build(cwd, {
      frozen: !defaultFlags(flags, { fix: false }).fix,
      prisma: true,
      ui: false,
    });
  }

  console.log(`${command} is an unknown command`);
  console.log(help);
  throw new ExitError(1);
}
