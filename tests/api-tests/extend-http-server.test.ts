import { IncomingMessage, ServerResponse } from 'http';
import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { setupTestRunner } from '@keystone-6/core/testing';
import supertest from 'supertest';
import { apiTestConfig } from './utils';

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: { User: list({ fields: { name: text() } }) },
    server: {
      extendHttpServer: server => {
        server.on('request', (req: IncomingMessage, res: ServerResponse) => {
          req.headers.testHeader = 'test';
          res.end('test');
        });
      },
    },
  }),
});

test(
  'basic extension',
  runner(async ({ app }) => {
    const { text } = await supertest(app).get('/anything').expect('testHeader', 'test');
    expect(JSON.parse(text)).toEqual('test');
  })
);
