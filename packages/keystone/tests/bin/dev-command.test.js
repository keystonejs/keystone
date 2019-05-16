const fs = require('fs');
const tmp = require('tmp');
const http = require('http');
const express = require('express');
const devCommand = require('../../bin/commands/dev');
const constants = require('../../constants');

async function expectServerResponds({ port, host = 'localhost', path = '/' }) {
  // A quick and dirty request for response code + headers (but no body)
  const { statusCode } = await new Promise((resolve, reject) => {
    const req = http.get({ host, port, path }, resolve);
    req.on('error', error => reject(error));
  });

  expect(statusCode).toBe(200);
}

function cleanupServer(server) {
  // Cleanup
  return new Promise((resolve, reject) => {
    server.close(error => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

describe('dev command', () => {
  test('exports', () => {
    expect(typeof devCommand.spec).toBe('object');
    expect(typeof devCommand.help).toBe('function');
    expect(typeof devCommand.exec).toBe('function');
  });

  test('help returns a string', () => {
    expect(typeof devCommand.help({ exeName: '' })).toBe('string');
  });

  describe('--entry arg', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      // See: https://twitter.com/JessTelford/status/1102801062489018369
      jest.resetModules();
      jest.dontMock('../../lib/prepare');
    });

    test('rejects when file not found', () => {
      expect(devCommand.exec({ '--entry': 'foo.js', _cwd: __dirname })).rejects.toThrow(
        /--entry=.*was passed.*but.*couldn't be found/
      );
    });

    test('is setup with a default server on default port', async () => {
      const mockPrepare = jest.fn(() =>
        Promise.resolve({
          middlewares: [express().get('/', (req, res) => res.status(200).end())],
          keystone: { connect: jest.fn() },
        })
      );

      // clear the module from the cache so we can mock it
      jest.resetModules();
      jest.doMock('../../lib/prepare', () => mockPrepare);

      const localDevCommand = require('../../bin/commands/dev');
      const serverFileObj = tmp.fileSync({ postfix: '.js' });
      fs.writeFileSync(serverFileObj.fd, `module.exports = { keystone: { auth: {} } }`);

      const { server } = await localDevCommand.exec({ '--entry': serverFileObj.name });

      await expectServerResponds({ port: constants.DEFAULT_PORT });
      return cleanupServer(server);
    });
  });

  describe('--port arg', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      // See: https://twitter.com/JessTelford/status/1102801062489018369
      jest.resetModules();
      jest.dontMock('../../lib/prepare');
    });

    test('prepare server with passed in port', async () => {
      const mockPrepare = jest.fn(() =>
        Promise.resolve({
          middlewares: [express().get('/', (req, res) => res.status(200).end())],
          keystone: { connect: jest.fn() },
        })
      );

      // clear the module from the cache so we can mock it
      jest.resetModules();
      jest.doMock('../../lib/prepare', () => mockPrepare);

      const localDevCommand = require('../../bin/commands/dev');
      const serverFileObj = tmp.fileSync({ postfix: '.js' });
      fs.writeFileSync(serverFileObj.fd, `module.exports = { keystone: { auth: {} } }`);

      const port = 5000;

      const { server } = await localDevCommand.exec({
        '--entry': serverFileObj.name,
        '--port': port,
      });

      await expectServerResponds({ port });
      return cleanupServer(server);
    });
  });
});
