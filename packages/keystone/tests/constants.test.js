const constants = require('../constants');

describe('constants()', () => {
  test('exports', () => {
    expect(typeof constants.DEFAULT_PORT).toBe('number');
    expect(typeof constants.DEFAULT_ENTRY).toBe('string');
    expect(typeof constants.DEFAULT_SERVER).toBe('string');
    expect(typeof constants.DEFAULT_DIST_DIR).toBe('string');
    expect(typeof constants.DEFAULT_COMMAND).toBe('string');
  });
});
