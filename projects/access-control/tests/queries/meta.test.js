const { Text, Relationship } = require('@voussoir/fields');
const { keystoneMongoTest, setupServer, graphqlRequest } = require('@voussoir/test-utils');
const cuid = require('cuid');

function setupKeystone() {
  return setupServer({
    name: `ks5-testdb-${cuid()}`,
    createLists: keystone => {
      keystone.createList('User', {
        fields: {
          company: { type: Relationship, ref: 'Company' },
          workHistory: { type: Relationship, ref: 'Company', many: true, access: { read: false } },
          posts: { type: Relationship, ref: 'Post', many: true },
        },
      });

      keystone.createList('Company', {
        fields: {
          name: { type: Text },
          employees: { type: Relationship, ref: 'User' },
        },
      });

      keystone.createList('Post', {
        fields: {
          content: { type: Text },
          author: { type: Relationship, ref: 'User' },
        },
        access: {
          read: false,
        },
      });
    },
  });
}

describe('_FooMeta query for individual list meta data', () => {
  test(
    `'access' field returns results`,
    keystoneMongoTest(setupKeystone, async ({ server: { server } }) => {
      const query = await graphqlRequest({
        server,
        query: `
          query {
            _CompaniesMeta {
              access {
                create
                read
                update
                delete
              }
            }
          }
      `,
      });

      expect(query.body).not.toHaveProperty('errors');
      expect(query.body).toHaveProperty('data._CompaniesMeta.access');
      expect(query.body.data._CompaniesMeta.access).toMatchObject({
        create: true,
        read: true,
        update: true,
        delete: true,
      });
    })
  );
});
