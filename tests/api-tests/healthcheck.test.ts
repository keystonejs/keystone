import { list } from '@keystone-next/keystone';
import { text } from '@keystone-next/keystone/fields';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import supertest from 'supertest';
import { apiTestConfig } from './utils';

const makeRunner = (healthCheck: any) =>
  setupTestRunner({
    config: apiTestConfig({
      lists: { User: list({ fields: { name: text() } }) },
      server: { healthCheck },
    }),
  });

test(
  'No health check',
  makeRunner(undefined)(async ({ app }) => {
    await supertest(app).get('/_healthcheck').set('Accept', 'application/json').expect(404);
  })
);

test(
  'Default health check',
  makeRunner(true)(async ({ app }) => {
    const { text } = await supertest(app)
      .get('/_healthcheck')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(JSON.parse(text)).toEqual({
      status: 'pass',
      timestamp: expect.any(Number),
    });
  })
);

test(
  'Custom path',
  makeRunner({ path: '/custom' })(async ({ app }) => {
    const { text } = await supertest(app)
      .get('/custom')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(JSON.parse(text)).toEqual({
      status: 'pass',
      timestamp: expect.any(Number),
    });
  })
);

test(
  'Custom data: object',
  makeRunner({ data: { foo: 'bar' } })(async ({ app }) => {
    const { text } = await supertest(app)
      .get('/_healthcheck')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(JSON.parse(text)).toEqual({ foo: 'bar' });
  })
);

test(
  'Custom data: function',
  makeRunner({ data: () => ({ foo: 'bar' }) })(async ({ app }) => {
    const { text } = await supertest(app)
      .get('/_healthcheck')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(JSON.parse(text)).toEqual({ foo: 'bar' });
  })
);
