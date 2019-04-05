const tmp = require('tmp');
const path = require('path');
const devCommand = require('../../bin/commands/dev');

describe('dev command', () => {
  test('exports', () => {
    expect(typeof devCommand.spec).toBe('object');
    expect(typeof devCommand.help).toBe('function');
    expect(typeof devCommand.exec).toBe('function');
  });

  test('help returns a string', () => {
    expect(typeof devCommand.help({ exeName: '' })).toBe('string');
  });

  describe('--server arg', () => {
    test('rejects when file not found', () => {
      expect(devCommand.exec({ '--server': 'foo.js', _cwd: __dirname })).rejects.toThrow(
        /--server=.*was passed.*but.*couldn't be found/
      );
    });

    test('requires custom server', async () => {
      jest.resetModules();
      const serverFileObj = tmp.fileSync({ postfix: '.js' });
      let wasRequired = false;
      jest.doMock(serverFileObj.name, () => {
        wasRequired = true;
      });
      await devCommand.exec({ '--server': serverFileObj.name });
      expect(wasRequired).toBeTruthy();
    });

    describe('warnings', () => {
      afterEach(() => {
        jest.restoreAllMocks();
      });

      test('warns when --port also set', async () => {
        const mockWarn = jest.spyOn(global.console, 'warn').mockImplementation(jest.fn());
        const serverFileObj = tmp.fileSync({ postfix: '.js' });
        await devCommand.exec({ '--server': serverFileObj.name, '--port': 5000 });
        expect(mockWarn).toHaveBeenLastCalledWith(
          expect.stringContaining('--port CLI option does not work with a custom server')
        );
      });

      test('warns when --entry also set', async () => {
        const mockWarn = jest.spyOn(global.console, 'warn').mockImplementation(jest.fn());
        const serverFileObj = tmp.fileSync({ postfix: '.js' });
        await devCommand.exec({ '--server': serverFileObj.name, '--entry': 'foo.js' });
        expect(mockWarn).toHaveBeenLastCalledWith(
          expect.stringContaining('--entry CLI option does not work with a custom server')
        );
      });
    });
  });

  describe('--entry arg', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      // See: https://twitter.com/JessTelford/status/1102801062489018369
      jest.resetModules();
      jest.dontMock('@keystone-alpha/core');
    });

    test('rejects when file not found', () => {
      expect(devCommand.exec({ '--entry': 'foo.js', _cwd: __dirname })).rejects.toThrow(
        /--entry=.*was passed.*but.*couldn't be found/
      );
    });

    test('is setup with a default server', async () => {
      const coreModule = require('@keystone-alpha/core');

      const mockLog = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
      const mockServerStart = jest.fn();
      const mockPrepare = jest.fn(() =>
        Promise.resolve({
          server: { start: mockServerStart },
          keystone: { connect: jest.fn() },
        })
      );

      // clear the core module from the cache so we can mock it
      jest.resetModules();
      jest.doMock('@keystone-alpha/core', () => ({
        ...coreModule,
        prepare: mockPrepare,
      }));
      const localDevCommand = require('../../bin/commands/dev');
      const serverFileObj = tmp.fileSync({ postfix: '.js' });

      await localDevCommand.exec({ '--entry': serverFileObj.name });

      expect(mockPrepare).toHaveBeenCalledWith(
        expect.objectContaining({
          // On Mac OSX, require.resolve prefixes an extra `/private`, so we have
          // to add it here to mimic the internal behaviour of this method
          entryFile: require.resolve(path.resolve(serverFileObj.name)),
        })
      );

      expect(mockServerStart).toHaveBeenCalled();

      expect(mockLog).toHaveBeenLastCalledWith(expect.stringContaining(`KeystoneJS ready on port`));
    });
  });

  describe('--port arg', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      // See: https://twitter.com/JessTelford/status/1102801062489018369
      jest.resetModules();
      jest.dontMock('@keystone-alpha/core');
    });

    test('prepares server with default port', async () => {
      // Load up a fresh copy of the core module for use within our mock below
      jest.resetModules();
      const coreModule = require('@keystone-alpha/core');

      const mockLog = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
      const mockPrepare = jest.fn(() =>
        Promise.resolve({
          server: { start: jest.fn() },
          keystone: { connect: jest.fn() },
        })
      );

      // clear the core module from the cache so we can mock it
      jest.resetModules();
      jest.doMock('@keystone-alpha/core', () => ({
        ...coreModule,
        prepare: mockPrepare,
      }));
      const localDevCommand = require('../../bin/commands/dev');
      const serverFileObj = tmp.fileSync({ postfix: '.js' });

      await localDevCommand.exec({ '--entry': serverFileObj.name });

      expect(mockPrepare).toHaveBeenCalledWith(
        expect.objectContaining({
          // On Mac OSX, require.resolve prefixes an extra `/private`, so we have
          // to add it here to mimic the internal behaviour of this method
          entryFile: require.resolve(path.resolve(serverFileObj.name)),
          port: coreModule.DEFAULT_PORT,
        })
      );

      expect(mockLog).toHaveBeenLastCalledWith(
        expect.stringContaining(`KeystoneJS ready on port ${coreModule.DEFAULT_PORT}`)
      );
    });

    test('prepare server with passed in port', async () => {
      // Load up a fresh copy of the core module for use within our mock below
      jest.resetModules();
      const coreModule = require('@keystone-alpha/core');

      const mockLog = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
      const mockPrepare = jest.fn(() =>
        Promise.resolve({
          server: { start: jest.fn() },
          keystone: { connect: jest.fn() },
        })
      );

      // clear the core module from the cache so we can mock it
      jest.resetModules();
      jest.doMock('@keystone-alpha/core', () => ({
        ...coreModule,
        prepare: mockPrepare,
      }));
      const localDevCommand = require('../../bin/commands/dev');
      const serverFileObj = tmp.fileSync({ postfix: '.js' });
      const port = 5000;

      await localDevCommand.exec({ '--entry': serverFileObj.name, '--port': port });

      expect(mockPrepare).toHaveBeenCalledWith(
        expect.objectContaining({
          // On Mac OSX, require.resolve prefixes an extra `/private`, so we have
          // to add it here to mimic the internal behaviour of this method
          entryFile: require.resolve(path.resolve(serverFileObj.name)),
          port,
        })
      );

      expect(mockLog).toHaveBeenLastCalledWith(
        expect.stringContaining(`KeystoneJS ready on port ${port}`)
      );
    });
  });
});
