import http from 'http';
import { list, config } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { allowAll } from '@keystone-6/core/access';
import { dbConfig } from '../utils';

function makeQuery(size = 0) {
  const query = JSON.stringify({
    variables: {
      data: {
        value: `Test ${Date.now()}`,
      },
    },
    query: `mutation ($data: ThingCreateInput!) {
      item: createThing(data: $data) {
        id
      }
    }`,
  }).slice(1, -1);
  const padding = Math.max(0, size - (query.length + 3));
  return `{ ${' '.repeat(padding)} ${query} }`;
}

export const lists = {
  Thing: list({
    access: allowAll,
    fields: {
      value: text(),
    },
  }),
};

export default config({
  db: {
    ...dbConfig,
    onConnect: async () => {
      // try something ~2MiB
      const json = makeQuery(2 * 1024 * 1024);
      const req = http.request(
        {
          method: 'POST',
          host: 'localhost',
          port: 3000,
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': json.length,
          },
          path: '/api/graphql',
        },
        res => {
          const { statusCode, headers } = res;
          console.error({ statusCode, headers });
          res.on('data', data => console.error(data.toString('utf8')));
        }
      );

      req.end(json);
    },
  },
  graphql: {
    bodyParser: {
      limit: '10mb',
    },
  },
  lists,
});
