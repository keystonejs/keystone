import { text } from '../../fields';
import { config, list } from '../..';
import { ExitError } from '../utils';
import {
  getFiles,
  recordConsole,
  runCommand,
  schemas,
  symlinkKeystoneDeps,
  testdir,
} from './utils';

const basicKeystoneConfig = {
  kind: 'config' as const,
  config: config({
    db: { provider: 'sqlite', url: 'file:./app.db' },
    lists: {
      Todo: list({
        fields: {
          title: text(),
        },
      }),
    },
  }),
};

describe.each(['postinstall', 'build', 'prisma migrate status'])('%s', command => {
  test('logs an error and exits with 1 when the schemas do not exist and the terminal is non-interactive', async () => {
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': basicKeystoneConfig,
    });
    const recording = recordConsole();
    await expect(runCommand(tmp, command)).rejects.toEqual(new ExitError(1));
    expect(recording()).toMatchInlineSnapshot(`
      "Your Prisma and GraphQL schemas are not up to date
      Please run keystone postinstall --fix to update your Prisma and GraphQL schemas"
    `);
  });
});

// a lot of these cases are also the same for prisma and build commands but we don't include them here
// because when they're slow and then run the same code as the postinstall command
// (and in the case of the build command we need to spawn a child process which would make each case take a _very_ long time)
describe('postinstall', () => {
  test('prompts when in an interactive terminal to update the schema', async () => {
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': basicKeystoneConfig,
    });
    const recording = recordConsole({
      'Would you like to update your Prisma and GraphQL schemas?': true,
    });
    await runCommand(tmp, 'postinstall');
    const files = await getFiles(tmp, ['schema.prisma', 'schema.graphql']);
    // to update them
    // for (const [file, content] of Object.entries(files)) {
    //   require('fs').writeFileSync(`${__dirname}/fixtures/basic-project/${file}`, content);
    // }
    expect(files).toEqual(await getFiles(`${__dirname}/fixtures/basic-project`));
    expect(recording()).toMatchInlineSnapshot(`
      "Your Prisma and GraphQL schemas are not up to date
      Prompt: Would you like to update your Prisma and GraphQL schemas? true
      ✨ GraphQL and Prisma schemas are up to date"
    `);
  });
  test('updates the schemas without prompting when --fix is passed', async () => {
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': basicKeystoneConfig,
    });
    const recording = recordConsole();
    await runCommand(tmp, 'postinstall --fix');
    const files = await getFiles(tmp, ['schema.prisma', 'schema.graphql']);
    expect(files).toEqual(await getFiles(`${__dirname}/fixtures/basic-project`));
    expect(recording()).toMatchInlineSnapshot(`"✨ Generated GraphQL and Prisma schemas"`);
  });
  test("does not prompt, error or modify the schemas if they're already up to date", async () => {
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      ...schemas,
      'keystone.js': basicKeystoneConfig,
    });
    const recording = recordConsole();
    await runCommand(tmp, 'postinstall');
    const files = await getFiles(tmp, ['schema.prisma', 'schema.graphql']);
    expect(files).toEqual(await getFiles(`${__dirname}/fixtures/basic-project`));
    expect(recording()).toMatchInlineSnapshot(`"✨ GraphQL and Prisma schemas are up to date"`);
  });
  test('writes the correct node_modules files', async () => {
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      ...schemas,
      'keystone.js': basicKeystoneConfig,
    });
    const recording = recordConsole();
    await runCommand(tmp, 'postinstall');
    expect(await getFiles(tmp, ['node_modules/.keystone/**/*'])).toMatchSnapshot();
    expect(recording()).toMatchInlineSnapshot(`"✨ GraphQL and Prisma schemas are up to date"`);
  });
  test('writes the api files when the generateNodeAPI experimental flag is on', async () => {
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      ...schemas,
      'keystone.js': {
        kind: 'config',
        config: { ...basicKeystoneConfig.config, experimental: { generateNodeAPI: true } },
      },
    });
    const recording = recordConsole();
    await runCommand(tmp, 'postinstall');
    expect(await getFiles(tmp, ['node_modules/.keystone/api.{d.ts,js}'])).toMatchInlineSnapshot(`
      ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ node_modules/.keystone/api.d.ts ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
      import { KeystoneListsAPI } from '@keystone-6/core/types';
      import { Context } from './types';

      export const query: Context['query'];
      ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ node_modules/.keystone/api.js ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
      import keystoneConfig from '../../keystone';
      import { PrismaClient } from '.prisma/client';
      import { createQueryAPI } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/node-api';
      import path from 'path';

          path.join(__dirname, "../../../app.db");
          path.join(process.cwd(), "app.db");
          

      export const query = createQueryAPI(keystoneConfig, PrismaClient);

    `);
    expect(recording()).toMatchInlineSnapshot(`"✨ GraphQL and Prisma schemas are up to date"`);
  });
  test('writes the next graphql api route files when the generateNextGraphqlAPI experimental flag is on', async () => {
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      ...schemas,
      'keystone.js': {
        kind: 'config',
        config: { ...basicKeystoneConfig.config, experimental: { generateNextGraphqlAPI: true } },
      },
    });
    const recording = recordConsole();
    await runCommand(tmp, 'postinstall');
    expect(await getFiles(tmp, ['node_modules/.keystone/next/graphql-api.{d.ts,js}']))
      .toMatchInlineSnapshot(`
      ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ node_modules/.keystone/next/graphql-api.d.ts ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
      export const config: any;
      export default config;

      ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ node_modules/.keystone/next/graphql-api.js ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
      import keystoneConfig from '../../../keystone';
      import { PrismaClient } from '.prisma/client';
      import { nextGraphQLAPIRoute } from '@keystone-6/core/___internal-do-not-use-will-break-in-patch/next-graphql';
      import path from 'path';

          path.join(__dirname, "../../../app.db");
          path.join(process.cwd(), "app.db");
          

      export const config = {
        api: {
          bodyParser: false,
        },
      };

      export default nextGraphQLAPIRoute(keystoneConfig, PrismaClient);

    `);
    expect(recording()).toMatchInlineSnapshot(`"✨ GraphQL and Prisma schemas are up to date"`);
  });
});
