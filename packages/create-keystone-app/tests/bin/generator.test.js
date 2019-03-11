const generator = require('../../bin/generator');
const version = require('../../package.json').version;

describe('create-keystone-app generator', () => {
  test('prints version', () => {
    expect(generator.version()).toBe(version);
  });

  test('prints help', () => {
    expect(generator.help({})).toEqual(expect.stringContaining('Usage'));
  });
});
