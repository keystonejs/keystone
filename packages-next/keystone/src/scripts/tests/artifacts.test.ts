import { text } from '@keystone-next/fields';
import { config, list } from '../../schema';
import { ExitError } from '../utils';
import { recordConsole, runCommand, symlinkKeystoneDeps, testdir } from './utils';

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

describe.each(['postinstall', 'prisma migrate status', 'build'])('%s', command => {
  test('logs an error and exits with 1 when the schemas do not exist', async () => {
    process.stdout.isTTY = false;
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': basicKeystoneConfig,
    });
    const recording = recordConsole();
    await expect(runCommand(tmp, command)).rejects.toEqual(new ExitError(1));
    expect(recording()).toMatchInlineSnapshot(`
      "Your Prisma and GraphQL schemas are not up to date
      Please run keystone-next postinstall --fix to update your Prisma and GraphQL schemas"
    `);
  });
});
