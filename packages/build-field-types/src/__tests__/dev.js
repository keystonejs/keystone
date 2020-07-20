import fixturez from 'fixturez';
import spawn from 'spawndamnit';
import path from 'path';
import { install } from '../../test-utils';
import dev from '../dev';

const f = fixturez(__dirname);

jest.mock('../prompt');

test('dev command works in node', async () => {
  let tmpPath = f.copy('valid-monorepo-that-logs-stuff');

  await install(tmpPath);

  await dev(tmpPath);

  // i would require it but i don't want jest to do magical things
  let { code, stdout, stderr } = await spawn('node', [
    path.join(tmpPath, 'packages', 'package-one'),
  ]);
  expect(code).toBe(0);
  expect(stdout.toString().split('\n')).toEqual([
    'message from package two',
    'message from package one',
    'message from package two but logged by package one',
    '',
  ]);
  expect(stdout.toString()).toMatchInlineSnapshot(`
  "message from package two
  message from package one
  message from package two but logged by package one
  "
  `);
  expect(stderr.toString()).toBe('');
});

test('source maps work', async () => {
  let tmpPath = f.copy('uses-babel-and-throws-error');

  await install(tmpPath);

  await dev(tmpPath);

  // i would require it but i don't want jest to do magical things
  let { code, stdout, stderr } = await spawn('node', [tmpPath]);

  expect(code).toBe(1);
  expect(stdout.toString()).toBe('');
  expect(
    // this is easier than using a stack trace parser
    stderr
      .toString()
      .trim()
      .split('\n')[0]
  ).toEqual(
    // the important thing we're checking is that it's mapping to line 5
    expect.stringMatching(/uses-babel-and-throws-error\/src\/index\.js:5$/)
  );
});
