const users = [
  {
    name: 'Boris Bozic',
    email: 'boris@keystone-alpha.com',
    company: 'thinkmill',
    isAdmin: true,
    dob: '1990-01-01',
    lastOnline: '2018-08-16T11:08:18.886+10:00',
    color: '#a8ff00',
    website: 'https://example.com',
  },
  {
    name: 'Jed Watson',
    email: 'jed@keystone-alpha.com',
    company: 'thinkmill',
    isAdmin: true,
  },
  {
    name: 'John Molomby',
    email: 'john@keystone-alpha.com',
    company: 'thinkmill',
    isAdmin: true,
  },
  {
    name: 'Joss Mackison',
    email: 'joss@keystone-alpha.com',
    company: 'thinkmill',
    isAdmin: true,
  },
  {
    name: 'Ben Conolly',
    email: 'ben@keystone-alpha.com',
    company: 'thinkmill',
    isAdmin: true,
  },
  {
    name: 'Luke Batchelor',
    email: 'luke@keystone-alpha.com',
    company: 'atlassian',
    isAdmin: false,
  },
  {
    name: 'Jared Crowe',
    email: 'jared@keystone-alpha.com',
    company: 'atlassian',
    isAdmin: false,
  },
  {
    name: 'Tom Walker',
    email: 'gelato@thinkmill.com.au',
    company: 'gelato',
  },
];

module.exports = {
  initialPosts: {
    Post: [
      {
        name: 'Lets talk React Router',
        author: { where: { email: 'ben@keystone-alpha.com' } },
        categories: { where: { name_starts_with: 'React' } },
      },
      {
        name: 'Hello Things',
      },
      {
        name: 'How we built Keystone 5',
        author: { where: { email: 'jared@keystone-alpha.com' } },
        categories: [
          { where: { name: 'React' } },
          { where: { name: 'Keystone' } },
          { where: { name: 'GraphQL' } },
          { where: { name: 'Node' } },
        ],
      },
    ].concat(
      Array(120)
        .fill(true)
        .map((v, i) => ({
          name: `Why ${i} is better than ${i - 1}`,
          author: { where: { email: users[i % users.length].email } },
          categories: { where: { name: 'Number comparison' } },
          views: i,
        }))
    ),
  },
  initialData: {
    PostCategory: [
      { name: 'GraphQL' },
      { name: 'Keystone' },
      { name: 'Node' },
      { name: 'React' },
      { name: 'React Router' },
      { name: 'Number comparison' },
    ],
    User: users.map(user => ({ ...user, password: 'password' })),
  },
};
