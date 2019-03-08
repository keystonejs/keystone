const fs = require('fs');
const tmp = require('tmp');
const endent = require('endent');
const isPromise = require('p-is-promise');

const core = require('../');

describe('@keystone-alpha/core/index.js', () => {
  test('exports', () => {
    expect(typeof core.DEFAULT_PORT).toBe('number');
    expect(typeof core.DEFAULT_ENTRY).toBe('string');
    expect(typeof core.DEFAULT_SERVER).toBe('string');
    expect(typeof core.prepare).toBe('function');
  });

  describe('#prepare()', () => {
    test('returns a Promise', () => {
      // NOTE: We add a `.catch()` to silence the "unhandled promise rejection"
      // warning
      expect(isPromise(core.prepare().catch(() => {}))).toBeTruthy();
    });

    describe('entryFile config', () => {
      test('rejects for missing default file', () => {
        expect(core.prepare({ _cwd: __dirname })).rejects.toThrow(/Cannot find module/);
      });

      test('rejects for missing relative supplied file', () => {
        expect(core.prepare({ entryFile: 'foo.js', _cwd: __dirname })).rejects.toThrow(
          /Cannot find module/
        );
      });

      test('rejects for missing absolute supplied file', () => {
        expect(core.prepare({ entryFile: '/tmp/foo.js', _cwd: __dirname })).rejects.toThrow(
          /Cannot find module/
        );
      });

      test('rejects if requiring fails', () => {
        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, 'throw new Error("Uh-oh")');
        expect(core.prepare({ entryFile: entryFileObj.name })).rejects.toThrow('Uh-oh');
      });
    });

    describe('entryFile exports', () => {
      test('rejects if keystone export missing', () => {
        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, 'module.exports = { }');
        expect(core.prepare({ entryFile: entryFileObj.name })).rejects.toThrow(
          "No 'keystone' export found"
        );
      });

      test('serverConfig should be an object', () => {
        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, 'module.exports = { keystone: {}, serverConfig: {} }');
        // NOTE: The promise will still reject (because `keystone` isn't a real
        // instance), but we test here that it doesn't complain about the
        // serverConfig object.
        expect(core.prepare({ entryFile: entryFileObj.name })).rejects.not.toThrow(
          "'serverConfig' must be an object"
        );
      });

      test('rejects if serverConfig export not an object', () => {
        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, 'module.exports = { keystone: {}, serverConfig: 1 }');
        expect(core.prepare({ entryFile: entryFileObj.name })).rejects.toThrow(
          "'serverConfig' must be an object"
        );
      });
    });

    describe('serverConfig config', () => {
      afterEach(() => {
        jest.restoreAllMocks();
        // See: https://twitter.com/JessTelford/status/1102801062489018369
        jest.resetModules();
        jest.dontMock('@keystone-alpha/server');
      });

      test('Cannot pass both entryFile#serverConfig and .serverConfig', () => {
        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, 'module.exports = { keystone: {}, serverConfig: {} }');
        // NOTE: The promise will still reject (because `keystone` isn't a real
        // instance), but we test here that it doesn't complain about the
        // serverConfig object.
        expect(core.prepare({ entryFile: entryFileObj.name, serverConfig: {} })).rejects.toThrow(
          "Ambiguous 'serverConfig' detected"
        );
      });

      test('serverConfig should be an object', () => {
        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, 'module.exports = { keystone: {} }');
        // NOTE: The promise will still reject (because `keystone` isn't a real
        // instance), but we test here that it doesn't complain about the
        // serverConfig object.
        expect(
          core.prepare({ entryFile: entryFileObj.name, serverConfig: {} })
        ).rejects.not.toThrow("'serverConfig' must be an object");
      });

      test('rejects if serverConfig export not an object', () => {
        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, 'module.exports = { keystone: {} }');
        expect(core.prepare({ entryFile: entryFileObj.name, serverConfig: 1 })).rejects.toThrow(
          "'serverConfig' must be an object"
        );
      });

      test('constructs a new server', async () => {
        // Called internally within the .prepare() function, so we mock it out
        // here, and replace the implementation on a per-test basis
        const mockServerClass = jest.fn(() => {});
        jest.resetModules();
        jest.doMock('@keystone-alpha/server', () => ({
          // Mock the class to do nothing
          WebServer: mockServerClass,
        }));

        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, `module.exports = { keystone: { auth: {} } }`);

        const localCore = require('../');
        await localCore.prepare({ entryFile: entryFileObj.name });

        expect(mockServerClass).toHaveBeenCalled();
      });

      test('constructs server with default options', async () => {
        // Called internally within the .prepare() function, so we mock it out
        // here, and replace the implementation on a per-test basis
        const mockServerClass = jest.fn(() => {});
        jest.resetModules();
        jest.doMock('@keystone-alpha/server', () => ({
          // Mock the class to do nothing
          WebServer: mockServerClass,
        }));

        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, `module.exports = { keystone: { auth: {} } }`);

        const localCore = require('../');
        await localCore.prepare({ entryFile: entryFileObj.name });

        expect(mockServerClass).toHaveBeenCalledWith(
          // The keystone object
          expect.anything(),
          // The config object
          expect.objectContaining({
            port: 3000,
          })
        );
      });

      test('constructs server with given options', async () => {
        // Called internally within the .prepare() function, so we mock it out
        // here, and replace the implementation on a per-test basis
        const mockServerClass = jest.fn(() => {});
        jest.resetModules();
        jest.doMock('@keystone-alpha/server', () => ({
          // Mock the class to do nothing
          WebServer: mockServerClass,
        }));

        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(
          entryFileObj.fd,
          endent`
        module.exports = {
          keystone: { auth: {} },
          admin: {},
        };
      `
        );

        const serverConfig = {
          'cookie secret': 'abc',
          sessionStore: {},
          pinoOptions: {},
          cors: {},
          apiPath: 'def',
          graphiqlPath: 'xyz',
          apollo: {},
        };

        const localCore = require('../');
        await localCore.prepare({
          entryFile: entryFileObj.name,
          serverConfig,
          port: 5000,
        });

        expect(mockServerClass).toHaveBeenCalledWith(
          // The keystone object
          expect.anything(),
          // The config object
          expect.objectContaining({
            ...serverConfig,
            port: 5000,
            adminUI: expect.any(Object),
          })
        );
      });

      test('constructs server with default cookie secret if authStrategy set', async () => {
        // Called internally within the .prepare() function, so we mock it out
        // here, and replace the implementation on a per-test basis
        const mockServerClass = jest.fn(() => {});
        jest.resetModules();
        jest.doMock('@keystone-alpha/server', () => ({
          // Mock the class to do nothing
          WebServer: mockServerClass,
        }));

        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(
          entryFileObj.fd,
          `module.exports = { keystone: {}, serverConfig: { authStrategy: {} } }`
        );

        const localCore = require('../');
        await localCore.prepare({
          entryFile: entryFileObj.name,
        });

        expect(mockServerClass).toHaveBeenCalledWith(
          // The keystone object
          expect.anything(),
          // The config object
          expect.objectContaining({
            authStrategy: {},
            'cookie secret': 'qwerty',
          })
        );
      });

      test('returns the server instance', async () => {
        // Called internally within the .prepare() function, so we mock it out
        // here, and replace the implementation on a per-test basis
        const mockServerResult = {};
        const mockServerClass = jest.fn(() => mockServerResult);
        jest.resetModules();
        jest.doMock('@keystone-alpha/server', () => ({
          // Mock the class to do nothing
          WebServer: mockServerClass,
        }));

        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, `module.exports = { keystone: { auth: {} } }`);

        const localCore = require('../');
        const { server } = await localCore.prepare({ entryFile: entryFileObj.name });

        expect(server).toBe(mockServerResult);
      });

      test('returns the keystone instance', async () => {
        // Called internally within the .prepare() function, so we mock it out
        // here, and replace the implementation on a per-test basis
        const mockServerResult = {};
        const mockServerClass = jest.fn(() => mockServerResult);
        jest.resetModules();
        jest.doMock('@keystone-alpha/server', () => ({
          // Mock the class to do nothing
          WebServer: mockServerClass,
        }));

        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, `module.exports = { keystone: { auth: {}, hi: 'bye' } }`);

        const localCore = require('../');
        const { keystone } = await localCore.prepare({ entryFile: entryFileObj.name });

        expect(keystone).toEqual(
          expect.objectContaining({
            hi: 'bye',
          })
        );
      });
    });
  });
});
