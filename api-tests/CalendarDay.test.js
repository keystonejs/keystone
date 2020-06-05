const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystonejs/test-utils');
import { formatISO } from 'date-fns';

const { CalendarDay } = require('@keystonejs/fields');
const cuid = require('cuid');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
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
        'Valid date passes',
        runner(setupKeystone, async ({ keystone }) => {
          const { data } = await graphqlRequest({
            keystone,
            query: `mutation { createUser(data: { birthday: "2001-01-01" }) { birthday } }`,
          });

          expect(data).toHaveProperty('createUser.birthday', '2001-01-01');
        })
      );

      test(
        'Invalid date fails passes',
        runner(setupKeystone, async ({ keystone }) => {
          const { errors } = await graphqlRequest({
            keystone,
            query: `mutation { createUser(data: { birthday: "3000-01-01" }) { birthday } }`,
          });
          expect(errors).toHaveLength(1);
          const error = errors[0];
          expect(error.message).toEqual('You attempted to perform an invalid mutation');
        })
      );
    });
  })
);
