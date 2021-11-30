const { text } = require('@keystone-6/core/fields');
const { list } = require('@keystone-6/core');
const { setupTestRunner } = require('@keystone-6/core/testing');
const { apiTestConfig } = require('../../utils.ts');
const { FixtureGroup, timeQuery, populate, range } = require('../lib/utils');

const runner = setupTestRunner({
  config: apiTestConfig({
    lists: {
      User: list({
        fields: {
          name: text(),
        },
      }),
    },
  }),
});

const group = new FixtureGroup(runner);

group.add({
  fn: async ({ context, provider }) => {
    const query = `
    mutation {
      createUser(data: { name: "test" }) { id }
    }`;
    const { time, success } = await timeQuery({ context, query });
    console.log({ provider, time, success, name: 'Cold create, N=1' });
  },
});

group.add({
  fn: async ({ context, provider }) => {
    const query = `
    mutation {
      createUser(data: { name: "test" }) { id }
    }`;
    const { time, success } = await timeQuery({ context, query });
    console.log({ provider, time, success, name: 'Warm create, N=1' });
  },
});

range(15).forEach(i => {
  const N = 2 ** i;
  group.add({
    fn: async ({ context, provider }) => {
      const query = `
      mutation createMany($users: [UserCreateInput!]!){
        createUsers(data: $users) { id }
      }`;
      const variables = { users: populate(N, i => ({ name: `test${i}` })) };
      const { time, success } = await timeQuery({ context, query, variables });
      console.log({ provider, time, success, name: `Create-many, N=${N}` });
    },
  });
});

module.exports = [group];
