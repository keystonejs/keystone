const fs = require('fs');
const tmp = require('tmp');
const http = require('http');
const devCommand = require('../../bin/commands/dev');
const constants = require('../../constants');

const mockSpinner = {
  text: '',
  start: () => {},
  succeed: () => {},
  fail: () => {},
  info: () => {},
};

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

  test('rejects when --entry file not found', () => {
    expect(
      devCommand.exec({ '--entry': 'foo.js', _cwd: __dirname }, undefined, mockSpinner)
    ).rejects.toThrow(/--entry=.*was passed.*but.*couldn't be found/);
  });

  test('is setup with a default server on default port', async () => {
    const localDevCommand = require('../../bin/commands/dev');
    const serverFileObj = tmp.fileSync({ postfix: '.js' });
    fs.writeFileSync(
      serverFileObj.fd,
      `
      module.exports = {
        // A mock keystone instance
        keystone: {
          auth: {},
          prepare: () => Promise.resolve({ middlewares: (req, res, next) => res.send(200) }),
          connect: () => Promise.resolve(),
        }
      }`
    );

    const { server } = await localDevCommand.exec(
      { '--entry': serverFileObj.name },
      undefined,
      mockSpinner
    );

    await expectServerResponds({ port: constants.DEFAULT_PORT });
    return cleanupServer(server);
  });

  test('prepare server with port from --port arg', async () => {
    const localDevCommand = require('../../bin/commands/dev');
    const serverFileObj = tmp.fileSync({ postfix: '.js' });
    fs.writeFileSync(
      serverFileObj.fd,
      `
      module.exports = {
        // A mock keystone instance
        keystone: {
          auth: {},
          prepare: () => Promise.resolve({ middlewares: (req, res, next) => res.send(200) }),
          connect: () => Promise.resolve(),
          configureServerApp: app => app,
        }
      }`
    );

    const port = 5000;

    const { server } = await localDevCommand.exec(
      {
        '--entry': serverFileObj.name,
        '--port': port,
      },
      undefined,
      mockSpinner
    );

    await expectServerResponds({ port });
    return cleanupServer(server);
  });
});
