import fixturez from 'fixturez';
import validate from '../validate';
import { FixableError } from '../errors';
import { logMock } from '../../test-utils';

const f = fixturez(__dirname);

jest.mock('../prompt');

afterEach(() => {
  jest.resetAllMocks();
});

test('reports correct result on valid package', async () => {
  let tmpPath = f.find('valid-package');

  await validate(tmpPath);
  expect(logMock.log.mock.calls).toMatchInlineSnapshot(`
        Array [
          Array [
            "🎁 info valid-package",
            "a valid entry point exists.",
          ],
          Array [
            "🎁 info valid-package",
            "main field is valid",
          ],
          Array [
            "🎁 info valid-package",
            "module field is valid",
          ],
          Array [
            "🎁 success",
            "project is valid!",
          ],
        ]
    `);
});

test('no main field', async () => {
  let tmpPath = f.find('no-main-field');

  try {
    await validate(tmpPath);
  } catch (e) {
    expect(e).toMatchInlineSnapshot(`[Error: main field is invalid]`);
    return;
  }

  expect(true).toBe(false);
});

test('no module', async () => {
  let tmpPath = f.find('no-module');
  try {
    await validate(tmpPath);
  } catch (err) {
    expect(err).toBeInstanceOf(FixableError);
    expect(err.message).toMatchInlineSnapshot(`"module field is invalid"`);
    return;
  }
  expect(true).toBe(false);
});

test('monorepo single package', async () => {
  let tmpPath = f.copy('monorepo-single-package');

  await validate(tmpPath);
  expect(logMock.log.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        "🎁 info @some-scope/package-two-single-package",
        "a valid entry point exists.",
      ],
      Array [
        "🎁 info @some-scope/package-two-single-package",
        "main field is valid",
      ],
      Array [
        "🎁 info @some-scope/package-two-single-package",
        "module field is valid",
      ],
      Array [
        "🎁 success",
        "project is valid!",
      ],
    ]
  `);
});
