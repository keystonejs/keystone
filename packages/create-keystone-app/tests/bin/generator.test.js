const version = require('../../package.json').version;
const child_process = require('child_process');
const path = require('path');

describe('create-keystone-app generator', () => {
  test('prints version', () => {
    const cli = child_process.spawnSync('node', [
      path.normalize(`${__dirname}/../../bin/cli.js`),
      '--version',
    ]);
    expect(cli.stdout.toString().trim()).toBe(version);
    expect(cli.stderr.toString().trim()).toEqual('');
  });

  test('prints help', () => {
    const cli = child_process.spawnSync('node', [
      path.normalize(`${__dirname}/../../bin/cli.js`),
      '--help',
    ]);
    expect(cli.stdout.toString().trim()).toEqual(expect.stringContaining('Usage'));
    expect(cli.stderr.toString().trim()).toEqual('');
  });

  test('prints error and help when used wrong', () => {
    const cli = child_process.spawnSync('node', [
      path.normalize(`${__dirname}/../../bin/cli.js`),
      '-x',
    ]);
    expect(cli.stderr.toString().trim()).toEqual(
      expect.stringContaining('Unknown or unexpected option')
    );
    expect(cli.stdout.toString().trim()).toEqual(expect.stringContaining('Usage'));
  });

  test('prints help when no arguments given', () => {
    const cli = child_process.spawnSync('node', [path.normalize(`${__dirname}/../../bin/cli.js`)]);
    expect(cli.stdout.toString().trim()).toEqual(expect.stringContaining('Usage'));
    expect(cli.stderr.toString().trim()).toEqual('');
  });

  test('copies the templates', () => {
    const folderName = 'unit-test-cli-tool';
    const folderPath = path.normalize(`${process.cwd()}/${folderName}`);

    const cli = child_process.spawnSync('node', [
      path.normalize(`${__dirname}/../../bin/cli.js`),
      folderName,
      '-n',
    ]);
    const files = child_process.spawnSync('ls', [folderPath]);
    child_process.spawnSync('rm', ['-rf', folderPath]);
    expect(cli.stdout.toString().trim()).toEqual(expect.stringContaining('KeystoneJS app created'));
    expect(cli.stderr.toString().trim()).toEqual('');
    expect(files.stdout.toString().trim()).toEqual(expect.stringContaining('package.json'));
    expect(files.stdout.toString().trim()).toEqual(expect.stringContaining('index.js'));
  });
});
