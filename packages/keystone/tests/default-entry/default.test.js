const prepare = require('../../lib/prepare');

describe('prepare', () => {
  describe('#prepare() default entry', () => {
    test('loads the default entry file', () => {
      // NOTE: prepare will still reject (because the default file doesn't have
      // valid exports), but we want to confirm that it doesn't throw with a
      // 'Cannot find module' error.
      expect(prepare({ _cwd: __dirname })).rejects.not.toThrow(/Cannot find module/);
    });

    test('rejects when default entry exists, but custom entry not found', () => {
      expect(prepare({ entryFile: 'foo.js', _cwd: __dirname })).rejects.toThrow(
        /Cannot find module/
      );
    });
  });
});
