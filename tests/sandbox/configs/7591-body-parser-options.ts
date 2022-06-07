import http from 'http';
import { list, config } from '@keystone-6/core';
import { text } from '@keystone-6/core/fields';
import { dbConfig } from '../utils';

export const lists = {
  Thing: list({
    fields: {
      value: text(),
    },
  }),
};

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
});

export default config({
  db: {
    ...dbConfig,
    onConnect: async () => {
      // try something ~2MiB
      const json = `{  ${' '.repeat(2*1024*1024)}   ${query.slice(1, -1)}   }`;
      const req = http.request({
        method: 'POST',
        host: 'localhost',
        port: 3000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': json.length
        },
        path: '/api/graphql',
      }, (res) => {
        const { statusCode, headers } = res;
        console.error({ statusCode, headers });
        res.on('data', (data) => console.error(data.toString('utf8')));
      });

      req.end(json);
    }
  },
  graphql: {
    bodyParser: {
      limit: '10mb'
    }
  },
  lists
});
