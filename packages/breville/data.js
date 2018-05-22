module.exports = {
  Post: [
    {
      name: 'Hello World',
    },
  ],
  PostCategory: [
    {
      name: 'GraphQL',
    },
    {
      name: 'Keystone',
    },
    {
      name: 'Node',
    },
    {
      name: 'React',
    },
  ],
  User: [
    {
      name: 'Boris Bozic',
      email: 'boris@keystonejs.com',
      company: 'thinkmill',
    },
    {
      name: 'Jed Watson',
      email: 'jed@keystonejs.com',
      company: 'thinkmill',
    },
    {
      name: 'John Molomby',
      email: 'john@keystonejs.com',
      company: 'thinkmill',
    },
    {
      name: 'Joss Mackison',
      email: 'joss@keystonejs.com',
      company: 'thinkmill',
    },
    {
      name: 'Ben Conolly',
      email: 'ben@keystonejs.com',
      company: 'thinkmill',
    },
    {
      name: 'Luke Batchelor',
      email: 'luke@keystonejs.com',
      company: 'atlassian',
    },
    {
      name: 'Jared Crowe',
      email: 'jared@keystonejs.com',
      company: 'atlassian',
    },
    {
      name: 'Tom Walker',
      email: 'gelato@thinkmill.com.au',
      company: 'gelato',
    },
  ].map(user => ({ ...user, password: 'password' })),
};
