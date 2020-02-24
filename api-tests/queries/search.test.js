const { Text, Integer } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer, graphqlRequest } = require('@keystonejs/test-utils');

const cuid = require('cuid');

function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('Test', {
        fields: {
          name: { type: Text },
        },
      });
      keystone.createList('Number', {
        fields: {
          name: { type: Integer },
        },
      });
    },
  });
}

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    test(
      'users',
      runner(setupKeystone, async ({ keystone, create }) => {
        await Promise.all([
          create('Test', { name: 'one' }),
          create('Test', { name: '%islikelike%' }),
          create('Test', { name: 'three' }),
          create('Number', { name: 12345 }),
        ]);

        let { data, errors } = await graphqlRequest({
          keystone,
          query: `
          query {
            allTests(
              search: "one",
            ) {
              name
            }
          }
      `,
        });
        expect(errors).toBe(undefined);
        expect(data).toHaveProperty('allTests');
        expect(data.allTests).toEqual([{ name: 'one' }]);

        ({ data, errors } = await graphqlRequest({
          keystone,
          query: `
          query {
            allTests(
              search: ${JSON.stringify(`%islikelike%`)},
            ) {
              name
            }
          }
      `,
        }));
        expect(errors).toBe(undefined);
        expect(data).toHaveProperty('allTests');
        expect(data.allTests).toEqual([{ name: '%islikelike%' }]);

        ({ data, errors } = await graphqlRequest({
          keystone,
          query: `
          query {
            allTests(
              search: ${JSON.stringify(`/thr(.*)/`)},
            ) {
              name
            }
          }
      `,
        }));
        expect(errors).toBe(undefined);
        expect(data).toHaveProperty('allTests');
        expect(data.allTests).toEqual([]); // No results

        ({ data, errors } = await graphqlRequest({
          keystone,
          query: `
          query {
            allNumbers(
              search: "12345",
            ) {
              name
            }
          }
      `,
        }));
        expect(errors).toBe(undefined);
        expect(data).toHaveProperty('allNumbers');
        expect(data.allNumbers).toEqual([]); // No results
      })
    );
  })
);
