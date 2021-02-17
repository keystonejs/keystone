const { text, relationship } = require('@keystone-next/fields');
const { createSchema, list } = require('@keystone-next/keystone/schema');
const { setupFromConfig } = require('@keystonejs/test-utils');
const { createItem, createItems } = require('@keystonejs/server-side-graphql-client');
const { FixtureGroup, timeQuery, populate, range } = require('../lib/utils');

function setupKeystone(adapterName) {
  return setupFromConfig({
    adapterName,
    config: createSchema({
      lists: {
        User: list({
          fields: {
            name: text(),
            posts: relationship({ ref: 'Post', many: true }),
          },
        }),
        Post: list({
          fields: {
            title: text(),
          },
        }),
      },
    }),
  });
}

const group = new FixtureGroup(setupKeystone);

group.add({
  fn: async ({ context, adapterName }) => {
    const { id: userId } = await createItem({
      context,
      listKey: 'User',
      item: { name: 'test', posts: { create: [] } },
    });
    const query = `query getPost($userId: ID!) { User(where: { id: $userId }) { id } }`;
    const { time, success } = await timeQuery({ context, query, variables: { userId } });
    console.log({ adapterName, time, success, name: 'Cold read with relationship, N=1' });
  },
});

group.add({
  fn: async ({ context, adapterName }) => {
    const { id: userId } = await createItem({
      context,
      listKey: 'User',
      item: { name: 'test', posts: { create: [] } },
    });
    const query = `query getUser($userId: ID!) { User(where: { id: $userId }) { id } }`;
    const { time, success } = await timeQuery({
      context,
      query,
      variables: { userId },
      repeat: 1000,
    });
    console.log({ adapterName, time, success, name: 'Warm read with relationship, N=1' });
  },
});

range(14).forEach(i => {
  const N = 1;
  const M = 2 ** i;
  group.add({
    fn: async ({ context, adapterName }) => {
      const posts = { create: populate(M, i => ({ title: `post${i}` })) };
      const users = await createItems({
        context,
        listKey: 'User',
        items: populate(N, i => ({ data: { name: `test${i}`, posts } })),
      });
      const userId = users[0].id;
      const query = `query getUser($userId: ID!) { User(where: { id: $userId }) { id } }`;
      const { time, success } = await timeQuery({
        context,
        query,
        variables: { userId },
        repeat: 1000,
      });
      console.log({
        adapterName,
        time,
        success,
        name: `Read single, ignore relationship, users=${N} posts=${M}`,
      });
    },
  });
});

const k = 14;
range(k).forEach(i => {
  const N = 2 ** i;
  const M = 2 ** (k - 1 - i);
  group.add({
    fn: async ({ context, adapterName }) => {
      const posts = { create: populate(M, i => ({ title: `post${i}` })) };
      const users = await createItems({
        context,
        listKey: 'User',
        items: populate(N, i => ({ data: { name: `test${i}`, posts } })),
      });
      const userId = users[0].id;
      const query = `query getUser($userId: ID!) { User(where: { id: $userId }) { id } }`;
      const { time, success } = await timeQuery({
        context,
        query,
        variables: { userId },
        repeat: 1000,
      });
      console.log({
        adapterName,
        time,
        success,
        name: `Read single, ignore relationship, users=${N} posts=${M}`,
      });
    },
  });
});

range(14).forEach(i => {
  const N = 1;
  const M = 2 ** i;
  group.add({
    fn: async ({ context, adapterName }) => {
      const posts = { create: populate(M, i => ({ title: `post${i}` })) };
      const users = await createItems({
        context,
        listKey: 'User',
        items: populate(N, i => ({ data: { name: `test${i}`, posts } })),
      });
      const userId = users[0].id;
      const query = `query getUser($userId: ID!) { User(where: { id: $userId }) { id posts { id } } }`;
      const { time, success } = await timeQuery({
        context,
        query,
        variables: { userId },
        repeat: 100,
      });
      console.log({
        adapterName,
        time,
        success,
        name: `Read single, read relationship, users=${N} posts=${M}`,
      });
    },
  });
});

range(k).forEach(i => {
  const N = 2 ** i;
  const M = 2 ** (k - 1 - i);
  group.add({
    fn: async ({ context, adapterName }) => {
      const posts = { create: populate(M, i => ({ title: `post${i}` })) };
      const users = await createItems({
        context,
        listKey: 'User',
        items: populate(N, i => ({ data: { name: `test${i}`, posts } })),
      });
      const userId = users[0].id;
      const query = `query getUser($userId: ID!) { User(where: { id: $userId }) { id posts { id } } }`;
      const { time, success } = await timeQuery({
        context,
        query,
        variables: { userId },
        repeat: 100,
      });
      console.log({
        adapterName,
        time,
        success,
        name: `Read single, read relationship, users=${N} posts=${M}`,
      });
    },
  });
});

module.exports = [group];
