const { text } = require('@keystone-next/fields');
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
      createUser(data: { name: "test" }) { id }
    }`;
    const { time, success } = await timeQuery({ context, query });
    console.log({ adapterName, time, success, name: 'Cold create, N=1' });
  },
});

group.add({
  fn: async ({ context, adapterName }) => {
    const query = `
    mutation {
      createUser(data: { name: "test" }) { id }
    }`;
    const { time, success } = await timeQuery({ context, query });
    console.log({ adapterName, time, success, name: 'Warm create, N=1' });
  },
});

range(15).forEach(i => {
  const N = 2 ** i;
  group.add({
    fn: async ({ context, adapterName }) => {
      const query = `
      mutation createMany($users: [UsersCreateInput]){
        createUsers(data: $users) { id }
      }`;
      const variables = { users: populate(N, i => ({ data: { name: `test${i}` } })) };
      const { time, success } = await timeQuery({ context, query, variables });
      console.log({ adapterName, time, success, name: `Create-many, N=${N}` });
    },
  });
});

module.exports = [group];
