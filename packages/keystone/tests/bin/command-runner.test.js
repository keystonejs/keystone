const commandRunner = require('../../bin/command-runner');
const version = require('../../package.json').version;

describe('keystone CLI command-runner', () => {
  test('prints version', () => {
    expect(commandRunner.version()).toBe(version);
  });

  test('prints help', () => {
    expect(commandRunner.help({})).toEqual(expect.stringContaining('Usage'));
  });

  test('prints help of commands', () => {
    expect(
      commandRunner.help({
        hello: {
          help: () => 'Hello command',
        },
      })
    ).toEqual(expect.stringContaining('Hello command'));
  });

  test('executes a given command', () => {
    expect(
      commandRunner.exec(
        {
          _: ['hello'],
        },
        {
          hello: {
            exec: jest.fn(() => Promise.resolve(true)),
          },
        }
      )
    ).resolves.toEqual(expect.anything());
  });

  test('executes the default command', () => {
    expect(
      commandRunner.exec(
        { _: [] },
        {
          [commandRunner.DEFAULT_COMMAND]: {
            exec: jest.fn(() => Promise.resolve(true)),
          },
        }
      )
    ).resolves.toEqual(expect.anything());
  });
});
