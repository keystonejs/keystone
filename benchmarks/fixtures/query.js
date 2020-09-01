const { Text, Relationship } = require('@keystonejs/fields');
const { createItem, createItems } = require('@keystonejs/server-side-graphql-client');
const { setupServer } = require('@keystonejs/test-utils');
const { FixtureGroup, timeQuery, populate, range } = require('../lib/utils');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          name: { type: Text },
          posts: { type: Relationship, ref: 'Post', many: true },
        },
      });
      keystone.createList('Post', {
        fields: {
          title: { type: Text },
        },
      });
    },
  });
}

const group = new FixtureGroup(setupKeystone);

group.add({
  fn: async ({ keystone, adapterName }) => {
    const { id: userId } = await createItem({
      keystone,
      item: { name: 'test', posts: { create: [] } },
    });
    const query = `query getPost($userId: ID!) { User(where: { id: $userId }) { id } }`;
    const { time, success } = await timeQuery({ keystone, query, variables: { userId } });
    console.log({ adapterName, time, success, name: 'Cold read with relationship, N=1' });
  },
});

group.add({
  fn: async ({ keystone, adapterName }) => {
    const { id: userId } = await createItem({
      keystone,
      item: { name: 'test', posts: { create: [] } },
    });
    const query = `query getUser($userId: ID!) { User(where: { id: $userId }) { id } }`;
    const { time, success } = await timeQuery({
      keystone,
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
    fn: async ({ keystone, adapterName }) => {
      const posts = { create: populate(M, i => ({ title: `post${i}` })) };
      const users = await createItems({
        keystone,
        item: populate(N, i => ({ data: { name: `test${i}`, posts } })),
      });
      const userId = users[0].id;
      const query = `query getUser($userId: ID!) { User(where: { id: $userId }) { id } }`;
      const { time, success } = await timeQuery({
        keystone,
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
    fn: async ({ keystone, adapterName }) => {
      const posts = { create: populate(M, i => ({ title: `post${i}` })) };
      const users = await createItems({
        keystone,
        item: populate(N, i => ({ data: { name: `test${i}`, posts } })),
      });
      const userId = users[0].id;
      const query = `query getUser($userId: ID!) { User(where: { id: $userId }) { id } }`;
      const { time, success } = await timeQuery({
        keystone,
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
    fn: async ({ keystone, adapterName }) => {
      const posts = { create: populate(M, i => ({ title: `post${i}` })) };
      const users = await createItems({
        keystone,
        item: populate(N, i => ({ data: { name: `test${i}`, posts } })),
      });
      const userId = users[0].id;
      const query = `query getUser($userId: ID!) { User(where: { id: $userId }) { id posts { id } } }`;
      const { time, success } = await timeQuery({
        keystone,
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
    fn: async ({ keystone, adapterName }) => {
      const posts = { create: populate(M, i => ({ title: `post${i}` })) };
      const users = await createItems({
        keystone,
        item: populate(N, i => ({ data: { name: `test${i}`, posts } })),
      });
      const userId = users[0].id;
      const query = `query getUser($userId: ID!) { User(where: { id: $userId }) { id posts { id } } }`;
      const { time, success } = await timeQuery({
        keystone,
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
