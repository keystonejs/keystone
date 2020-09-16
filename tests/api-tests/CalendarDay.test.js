const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');

const { CalendarDay } = require('@keystonejs/fields');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          birthday: { type: CalendarDay, dateFrom: '2000-01-01', dateTo: '2020-01-01' },
        },
      });
    },
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    describe('CalendarDay type', () => {
      test(
        'Valid date passes validation',
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await keystone.executeGraphQL({
            query: `mutation { createUser(data: { birthday: "2001-01-01" }) { birthday } }`,
          });
          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('createUser.birthday', '2001-01-01');
        })
      );

      test(
        'date === dateTo passes validation',
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await keystone.executeGraphQL({
            query: `mutation { createUser(data: { birthday: "2020-01-01" }) { birthday } }`,
          });
          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('createUser.birthday', '2020-01-01');
        })
      );

      test(
        'date === dateFrom passes validation',
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await keystone.executeGraphQL({
            query: `mutation { createUser(data: { birthday: "2020-01-01" }) { birthday } }`,
          });
          expect(errors).toBe(undefined);
          expect(data).toHaveProperty('createUser.birthday', '2020-01-01');
        })
      );

      test(
        'Invalid date failsvalidation',
        runner(setupKeystone, async ({ keystone }) => {
          const { data, errors } = await keystone.executeGraphQL({
            query: `mutation { createUser(data: { birthday: "3000-01-01" }) { birthday } }`,
          });
          expect(errors).toHaveLength(1);
          const error = errors[0];
          expect(error.message).toEqual('You attempted to perform an invalid mutation');
          expect(data.createUser).toBe(null);
        })
      );
    });
  })
);
