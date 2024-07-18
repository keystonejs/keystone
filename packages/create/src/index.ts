import fs from 'fs-extra';
import path from 'path';
import meow from 'meow';
import enquirer from 'enquirer';
import execa from 'execa';
import ora from 'ora';
import c from 'chalk';
import terminalLink from 'terminal-link';
import { checkVersion } from './checkVersion';
import { UserError } from './utils';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const starterDir = path.normalize(`${__dirname}/../starter`);

const cli = meow(
  `
Usage
  $ create-keystone-app [directory]
`
);

type Args = {
  directory: string;
};

const versionInfo = () => {
  process.stdout.write('\n');
  console.log(`✨ You're about to generate a project using ${c.bold(
    'Keystone 6'
  )} packages.
`);
};

async function normalizeArgs(): Promise<Args> {
  let directory = cli.input[0];
  if (!directory) {
    ({ directory } = await enquirer.prompt({
      type: 'input',
      name: 'directory',
      message:
        'What directory should create-keystone-app generate your app into?',
      validate: (x) => !!x,
    }));
    process.stdout.write('\n');
  }
  return {
    directory: path.resolve(directory),
  };
}

async function installDeps (cwd: string) {
  const pkgManager = (process.env.npm_config_user_agent ?? 'npm').split('/').shift()
  const spinner = ora(
    `Installing dependencies with ${pkgManager}. This may take a few minutes.`
  ).start();
  try {
    await execa(pkgManager, ['install'], { cwd });
    spinner.succeed(`Installed dependencies with ${pkgManager}.`);
    return pkgManager;
  } catch (err) {
    spinner.fail(`Failed to install with ${pkgManager}.`);
    throw err;
  }
}

(async () => {
  versionInfo();
  await checkVersion();
  const normalizedArgs = await normalizeArgs();
  await fs.mkdir(normalizedArgs.directory);
  await Promise.all([
    ...[
      '_gitignore',
      'schema.ts',
      'package.json',
      'tsconfig.json',
      'schema.graphql',
      'schema.prisma',
      'keystone.ts',
      'auth.ts',
      'README.md',
    ].map((filename) =>
      fs.copyFile(
        path.join(starterDir, filename),
        path.join(normalizedArgs.directory, filename.replace(/^_/, '.'))
      )
    ),
  ]);
  const packageManager = await installDeps(normalizedArgs.directory);
  const relativeProjectDir = path.relative(
    process.cwd(),
    normalizedArgs.directory
  );
  process.stdout.write('\n');
  console.log(`🎉  Keystone created a starter project in: ${c.bold(
    relativeProjectDir
  )}

  ${c.bold('To launch your app, run:')}

  - cd ${relativeProjectDir}
  - ${packageManager} run dev

  ${c.bold('Next steps:')}

  - Read ${c.bold(
    `${relativeProjectDir}${path.sep}README.md`
  )} for additional getting started details.
  - Edit ${c.bold(
    `${relativeProjectDir}${path.sep}keystone.ts`
  )} to customize your app.
  - ${terminalLink('Open the Admin UI', 'http://localhost:3000')}
  - ${terminalLink('Open the Graphql API', 'http://localhost:3000/api/graphql')}
  - ${terminalLink('Read the docs', 'https://keystonejs.com')}
  - ${terminalLink(
    'Star Keystone on GitHub',
    'https://github.com/keystonejs/keystone'
  )}
`);
})().catch((err) => {
  if (err instanceof UserError) {
    console.error(err.message);
  } else {
    console.error(err);
  }
  process.exit(1);
});
