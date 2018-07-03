module.exports = {
  Post: [
    {
      name: 'Lets talk React Router',
      author: { where: { email: 'ben@keystonejs.com' } },
      categories: { where: { name_starts_with: 'React' } },
    },
    {
      name: 'Hello Things',
    },
    {
      name: 'How we built Keystone 5',
      author: { where: { email: 'jared@keystonejs.com' } },
      categories: [
        { where: { name: 'React' } },
        { where: { name: 'Keystone' } },
        { where: { name: 'GraphQL' } },
        { where: { name: 'Node' } },
      ],
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
    {
      name: 'React Router',
    },
  ],
  User: [
    {
      name: 'Boris Bozic',
      email: 'boris@keystonejs.com',
      company: 'thinkmill',
      isAdmin: true,
    },
    {
      name: 'Jed Watson',
      email: 'jed@keystonejs.com',
      company: 'thinkmill',
      isAdmin: true,
    },
    {
      name: 'John Molomby',
      email: 'john@keystonejs.com',
      company: 'thinkmill',
      isAdmin: true,
    },
    {
      name: 'Joss Mackison',
      email: 'joss@keystonejs.com',
      company: 'thinkmill',
      isAdmin: true,
    },
    {
      name: 'Ben Conolly',
      email: 'ben@keystonejs.com',
      company: 'thinkmill',
      isAdmin: true,
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
