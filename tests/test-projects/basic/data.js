const users = [
  {
    name: 'Boris Bozic',
    email: 'boris@keystone.com',
    company: 'thinkmill',
    isAdmin: true,
    dob: '1990-01-01',
    lastOnline: '2018-08-16T11:08:18.886+10:00',
    color: '#a8ff00',
    website: 'https://example.com',
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
    isAdmin: false,
  },
  {
    name: 'Jared Crowe',
    email: 'jared@keystone.com',
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
    {
      name: 'Number comparison',
    },
  ].map(x => ({ data: x })),
  ReadOnlyList: [
    {
      data: {
        name: 'ReadOnly',
        price: '25.25',
        markdownValue: '# markdown header',
        wysiwygValue: '<h1>html header</h1>',
        views: 25,
        currency: 'AUD',
      },
    },
  ],
  User: users.map(user => ({ data: { ...user, password: 'password' } })),
};
