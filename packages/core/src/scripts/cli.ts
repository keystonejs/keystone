import meow from 'meow';
import { ExitError } from './utils';
import { build } from './build/build';
import { dev } from './run/dev';
import { migrate } from './migrate';
import { postinstall } from './postinstall';
import { prisma } from './prisma';
import { start } from './run/start';
import { telemetry } from './telemetry';

export type Flags = {
  fix: boolean;
  resetDb: boolean;
  dbPush?: boolean;
  server?: boolean;
  prisma?: boolean;
  ui?: boolean;
  frozen: boolean;
  withMigrations: boolean;
};

export async function cli(cwd: string, argv: string[]) {
  const { input, help, flags } = meow(
    `
    Usage
      $ keystone [command]
    Commands
        dev           start the project in development mode (default)
        postinstall   build the project (for development, optional)
        build         build the project (required by \`keystone start\`)
        start         start the project
        migrate       setup and run database migrations
        prisma        run Prisma CLI commands safely
        telemetry     sets telemetry preference (enable/disable/status)
    `,
    {
      flags: {
        fix: { default: false, type: 'boolean' },
        resetDb: { default: false, type: 'boolean' },
        frozen: { default: false, type: 'boolean' },
        withMigrations: { default: false, type: 'boolean' },
      },
      argv,
    }
  );

  const command = input[0] || 'dev';
  if (command === 'dev') return dev(cwd, flags);
  if (command === 'postinstall') return postinstall(cwd, flags.fix)
  if (command === 'build') return build(cwd, flags);
  if (command === 'start') return start(cwd, flags);
  if (command === 'migrate') return migrate(cwd, input, flags.resetDb);
  if (command === 'prisma') return prisma(cwd, argv.slice(1));
  if (command === 'telemetry') return telemetry(cwd, argv[1]);

  console.log(`${command} is an unknown command`);
  console.log(help);
  throw new ExitError(1);
}
