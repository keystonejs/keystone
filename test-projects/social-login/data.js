module.exports = {
  Post: [
    {
      name: 'Lets talk React Router',
      author: { where: { email: 'ben@keystone.com' } },
      categories: { where: { name_starts_with: 'React' } },
    },
    {
      name: 'Hello Things',
    },
    {
      name: 'How we built Keystone 5',
      author: { where: { email: 'jared@keystone.com' } },
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
      email: 'boris@keystone.com',
      company: 'thinkmill',
      isAdmin: true,
    },
    {
      name: 'Jed Watson',
      email: 'jed@keystone.com',
      company: 'thinkmill',
      isAdmin: true,
    },
    {
      name: 'John Molomby',
      email: 'john@keystone.com',
      company: 'thinkmill',
      isAdmin: true,
    },
    {
      name: 'Joss Mackison',
      email: 'joss@keystone.com',
      company: 'thinkmill',
      isAdmin: true,
    },
    {
      name: 'Ben Conolly',
      email: 'ben@keystone.com',
      company: 'thinkmill',
      isAdmin: true,
    },
    {
      name: 'Luke Batchelor',
      email: 'luke@keystone.com',
      company: 'atlassian',
    },
    {
      name: 'Jared Crowe',
      email: 'jared@keystone.com',
      company: 'atlassian',
    },
    {
      name: 'Tom Walker',
      email: 'gelato@thinkmill.com.au',
      company: 'gelato',
    },
  ].map(user => ({ ...user, password: 'password' })),
};
