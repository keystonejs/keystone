const { text, relationship } = require('@keystone-next/fields');
const { createSchema, list } = require('@keystone-next/keystone/schema');
const { setupFromConfig } = require('@keystonejs/test-utils');
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
    const query = `
    mutation {
      createUser(data: { name: "test", posts: { create: [] } }) { id }
    }`;
    const { time, success } = await timeQuery({ context, query });
    console.log({ adapterName, time, success, name: 'Cold create with relationship, N=1' });
  },
});

group.add({
  fn: async ({ context, adapterName }) => {
    const query = `
    mutation {
      createUser(data: { name: "test", posts: { create: [] } }) { id }
    }`;
    const { time, success } = await timeQuery({ context, query });
    console.log({ adapterName, time, success, name: 'Warm create with relationship, N=1' });
  },
});

range(14).forEach(i => {
  const N = 1;
  const M = 2 ** i;
  group.add({
    fn: async ({ context, adapterName }) => {
      const query = `
      mutation createMany($users: [UsersCreateInput]){
        createUsers(data: $users) { id }
      }`;
      const posts = { create: populate(M, i => ({ title: `post${i}` })) };
      const variables = { users: populate(N, i => ({ data: { name: `test${i}`, posts } })) };
      const { time, success } = await timeQuery({ context, query, variables });
      console.log({
        adapterName,
        time,
        success,
        name: `Create-many with relationship, users=${N} posts=${M}`,
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
      const query = `
      mutation createMany($users: [UsersCreateInput]){
        createUsers(data: $users) { id }
      }`;
      const posts = { create: populate(M, i => ({ title: `post${i}` })) };
      const variables = { users: populate(N, i => ({ data: { name: `test${i}`, posts } })) };
      const { time, success } = await timeQuery({ context, query, variables });
      console.log({
        adapterName,
        time,
        success,
        name: `Create-many with relationship, users=${N} posts=${M}`,
      });
    },
  });
});

module.exports = [group];
