import { IncomingMessage, ServerResponse } from 'http';
import { list } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { setupTestRunner } from '@keystone-6/api-tests/test-runner';
import supertest from 'supertest';
import { allowAll } from '@keystone-6/core/access';
import { apiTestConfig } from './utils';
import { withServer } from './with-server';

const runner = withServer(
  setupTestRunner({
    config: apiTestConfig({
      lists: {
        // prettier-ignore
        User: list({
          access: allowAll,
          fields: {
            name: text()
          },
        }),
      },
      server: {
        extendHttpServer: server => {
          server.prependListener('request', (req: IncomingMessage, res: ServerResponse) => {
            res.setHeader('test-header', 'test-header-value');
          });
        },
      },
    }),
  })
);

test(
  'server extension',
  runner(async ({ server }) => {
    await supertest(server).get('/anything').expect('test-header', 'test-header-value');
  })
);
