import { ExitError } from '../utils';
import {
  basicKeystoneConfig,
  getFiles,
  recordConsole,
  runCommand,
  schemas,
  customPrismaKeystoneConfig,
  symlinkKeystoneDeps,
  testdir,
} from './utils';

describe.each(['postinstall', 'build --frozen', 'prisma migrate status'])('%s', command => {
  test('logs an error and exits with 1 when the schemas do not exist and the terminal is non-interactive', async () => {
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': basicKeystoneConfig,
    });
    const recording = recordConsole();
    await expect(runCommand(tmp, command)).rejects.toEqual(new ExitError(1));
    expect(recording()).toMatchInlineSnapshot(`
      "Your Prisma and GraphQL schemas are not up to date
      Use keystone dev to update the Prisma and GraphQL schemas"
    `);
  });
});

const schemasMatch = ['schema.prisma', 'schema.graphql'];

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
      'Replace the Prisma and GraphQL schemas?': true,
    });
    await runCommand(tmp, 'postinstall');
    const files = await getFiles(tmp, schemasMatch);
    expect(files).toEqual(await getFiles(`${__dirname}/fixtures/basic-project`, schemasMatch));
    expect(recording()).toMatchInlineSnapshot(`
      "Your Prisma and GraphQL schemas are not up to date
      Prompt: Replace the Prisma and GraphQL schemas? true
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
    const files = await getFiles(tmp, schemasMatch);
    expect(files).toEqual(await getFiles(`${__dirname}/fixtures/basic-project`, schemasMatch));
    expect(recording()).toMatchInlineSnapshot(`"✨ Generated GraphQL and Prisma schemas"`);
  });
  test('customising primsa schema through extendPrisma works', async () => {
    const tmp = await testdir({
      ...symlinkKeystoneDeps,
      'keystone.js': customPrismaKeystoneConfig,
    });
    const recording = recordConsole();
    await runCommand(tmp, 'postinstall --fix');
    const files = await getFiles(tmp, ['schema.prisma']);
    expect(files).toEqual(
      await getFiles(`${__dirname}/fixtures/custom-prisma-project`, ['schema.prisma'])
    );
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
    const files = await getFiles(tmp, schemasMatch);
    expect(files).toEqual(await getFiles(`${__dirname}/fixtures/basic-project`, schemasMatch));
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
});
