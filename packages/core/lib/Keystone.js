const { makeExecutableSchema } = require('graphql-tools');

module.exports = class Keystone {
  constructor() {
    this.lists = {};
  }
  createList(key, config) {
    this.lists[key] = config;
  }
  getAdminSchema() {
    const data = {
      users: [
        {
          name: 'Jed Watson',
          email: 'jed@keystonejs.com',
          password: 'password',
        },
      ],
    };
    const typeDefs = `
      type Query { users: [User] }
      type User { name: String, email: String, password: String }
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
