const fs = require('fs');
const tmp = require('tmp');
const isPromise = require('p-is-promise');

const prepare = require('../lib/prepare');

describe('prepare()', () => {
  describe('#prepare()', () => {
    test('returns a Promise', () => {
      // NOTE: We add a `.catch()` to silence the "unhandled promise rejection"
      // warning
      expect(isPromise(prepare().catch(() => {}))).toBeTruthy();
    });

    describe('entryFile config', () => {
      test('rejects for missing default file', () => {
        expect(prepare({ _cwd: __dirname })).rejects.toThrow(/Cannot find module/);
      });

      test('rejects for missing relative supplied file', () => {
        expect(prepare({ entryFile: 'foo.js', _cwd: __dirname })).rejects.toThrow(
          /Cannot find module/
        );
      });

      test('rejects for missing absolute supplied file', () => {
        expect(prepare({ entryFile: '/tmp/foo.js', _cwd: __dirname })).rejects.toThrow(
          /Cannot find module/
        );
      });

      test('rejects if requiring fails', () => {
        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, 'throw new Error("Uh-oh")');
        expect(prepare({ entryFile: entryFileObj.name })).rejects.toThrow('Uh-oh');
      });
    });

    describe('entryFile exports', () => {
      test('rejects if keystone export missing', () => {
        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, 'module.exports = { }');
        expect(prepare({ entryFile: entryFileObj.name })).rejects.toThrow(
          "No 'keystone' export found"
        );
      });

      test.todo('executes FIELD.prepareMiddleware()');
      test.todo('filters out empty middleware results');
      test.todo('flattens nested middlewares');
      test.todo('injects a default GraphQLServer if not found');
      test.todo('handles servers:undefined and servers:[]');
      test.todo('Handles servers without a `prepareMiddleware`');
      test.todo('calls prepareMiddleware with correct params');
    });

    describe('config', () => {
      afterEach(() => {
        jest.restoreAllMocks();
        // See: https://twitter.com/JessTelford/status/1102801062489018369
        jest.resetModules();
        jest.dontMock('@keystone-alpha/server-graphql');
      });

      test('constructs a new server', async () => {
        // Called internally within the .prepare() function, so we mock it out
        // here, and replace the implementation on a per-test basis
        jest.resetModules();
        jest.doMock('@keystone-alpha/server-graphql');

        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, `module.exports = { keystone: { auth: {} } }`);

        const localPrepare = require('../lib/prepare');
        await localPrepare({ entryFile: entryFileObj.name });

        expect(require('@keystone-alpha/server-graphql')).toHaveBeenCalled();
      });

      test('returns the middlewares array', async () => {
        // Called internally within the .prepare() function, so we mock it out
        // here, and replace the implementation on a per-test basis
        jest.resetModules();
        jest.doMock('@keystone-alpha/server-graphql');

        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, `module.exports = { keystone: { auth: {} } }`);

        const localPrepare = require('../lib/prepare');
        const { middlewares } = await localPrepare({ entryFile: entryFileObj.name });

        expect(middlewares).toBeInstanceOf(Array);
      });

      test('returns the keystone instance', async () => {
        // Called internally within the .prepare() function, so we mock it out
        // here, and replace the implementation on a per-test basis
        jest.resetModules();
        jest.doMock('@keystone-alpha/server-graphql');

        const entryFileObj = tmp.fileSync({ postfix: '.js' });
        fs.writeFileSync(entryFileObj.fd, `module.exports = { keystone: { auth: {}, hi: 'bye' } }`);

        const localPrepare = require('../lib/prepare');
        const { keystone } = await localPrepare({ entryFile: entryFileObj.name, dev: true });

        expect(keystone).toEqual(
          expect.objectContaining({
            hi: 'bye',
          })
        );
      });
    });
  });
});
