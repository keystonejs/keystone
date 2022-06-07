import fetch from 'node-fetch';
import { text } from '@keystone-6/core/fields';
import { list } from '@keystone-6/core';
import { setupTestRunner } from '@keystone-6/core/testing';
import type { Options as BodyParserOptions } from 'body-parser';
import { apiTestConfig } from './utils';

function makeQuery (size = 0) {
  const query = JSON.stringify({
    variables:{
      data:{
        value: `Test ${Date.now()}`
      }
    },
    query: `mutation ($data: ThingCreateInput!) {
      item: createThing(data: $data) {
        id
      }
    }`
  }).slice(1, -1);
  const padding = Math.max(0, size - (query.length + 3));
  return `{ ${' '.repeat(padding)} ${query} }`;
}

async function tryRequest (size: number) {
  const res = await fetch('http://localhost:3000/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: makeQuery(size)
  });
  if (res.status !== 200) return { res };
  const { data, errors } = await res.json();
  return { res, data, errors };
}

function setup(options?: BodyParserOptions) {
  return setupTestRunner({
    config: apiTestConfig({
      lists: {
        Thing: list({
          fields: {
            value: text(),
          },
        }),
      },
      graphql: {
        bodyParser: {
          // limit: '100kb', // the body-parser default
          ...options
        }
      },
    }),
  });
}

describe('Configuring .graphql.bodyParser', () => {
  test('defaults limits to 100KiB', setup()(async () => {
    // <100KiB
    {
    const { res } = await tryRequest(1024);
    expect(res.status).toEqual(200);
    }

    // === 100KiB
    {
    const { res } = await tryRequest(100*1024);
    expect(res.status).toEqual(413);
    }

    // > 100KiB
    {
    const { res } = await tryRequest(100*1024 + 1);
    expect(res.status).toEqual(413);
    }
  }));

  test.only('supports changing the limit', setup({
    // actually 10MiB
    limit: '10mb'
  })(async () => {
    // <10MiB
    {
    const { res } = await tryRequest(1024);
    expect(res.status).toEqual(200);
    }

    // === 10MiB
    {
    const { res } = await tryRequest(10*1024*1024);
    expect(res.status).toEqual(413);
    }

    // > 10MiB
    {
    const { res } = await tryRequest(10*1024*1024 + 1);
    expect(res.status).toEqual(413);
    }
  }));
});
