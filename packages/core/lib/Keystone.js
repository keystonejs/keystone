const { makeExecutableSchema } = require('graphql-tools');

module.exports = class Keystone {
  constructor() {
    this.lists = {};
  }
  createList(key, config) {
    this.lists[key] = config;
  }
  getAdminMeta() {
    return {
      brand: 'Keystone',
      lists: {
        User: {
          path: 'users',
          label: 'Users',
          plural: 'Users',
          singular: 'User',
          fields: [
            { path: 'name', type: 'Name' },
            { path: 'email', type: 'Email' },
            { path: 'password', type: 'Password' },
          ],
        },
      },
    };
  }
  getAdminSchema() {
    const data = {
      users: [
        {
          id: 'b2a1467e-a74b-470f-a137-f089c791a0ec',
          name: 'Jed Watson',
          email: 'jed@keystonejs.com',
          password: 'password',
        },
      ],
    };
    const typeDefs = `
      type Query {
        users: [User]
        user(id: String!): User
      }
      type User {
        name: String
        email: String
        password: String
      }
    `;
    const resolvers = {
      Query: { users: () => data.users },
    };
    return makeExecutableSchema({
      typeDefs,
      resolvers,
    });
  }
};
