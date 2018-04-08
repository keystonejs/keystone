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
          listQueryName: 'users',
          itemQueryName: 'user',
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
        {
          id: '91fb341a-c046-4c8d-9d37-f10d097d2508',
          name: 'Boris Bozic',
          email: 'boris@keystonejs.com',
          password: 'password',
        },
        {
          id: '9c04f6f0-8929-4802-a383-9d16227c9c2f',
          name: 'Joss Mackison',
          email: 'joss@keystonejs.com',
          password: 'password',
        },
        {
          id: 'fbdfb967-a5f5-4c1b-95ce-14ed5f75dd85',
          name: 'John Molomby',
          email: 'john@keystonejs.com',
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
        id: String
        name: String
        email: String
        password: String
      }
    `;
    const resolvers = {
      Query: {
        users: () => data.users,
        user: (_, { id }) => {
          console.log(id);
          return data.users.filter(i => i.id === id)[0];
        },
      },
    };
    return makeExecutableSchema({
      typeDefs,
      resolvers,
    });
  }
};
