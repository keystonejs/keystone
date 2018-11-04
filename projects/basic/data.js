const users = [
  {
    name: 'Boris Bozic',
    email: 'boris@voussoir.com',
    company: 'thinkmill',
    isAdmin: true,
    dob: '1990-01-01',
    lastOnline: '2018-08-16T11:08:18.886+10:00',
    color: '#a8ff00',
    website: 'https://example.com',
  },
  {
    name: 'Jed Watson',
    email: 'jed@voussoir.com',
    company: 'thinkmill',
    isAdmin: true,
  },
  {
    name: 'John Molomby',
    email: 'john@voussoir.com',
    company: 'thinkmill',
    isAdmin: true,
  },
  {
    name: 'Joss Mackison',
    email: 'joss@voussoir.com',
    company: 'thinkmill',
    isAdmin: true,
  },
  {
    name: 'Ben Conolly',
    email: 'ben@voussoir.com',
    company: 'thinkmill',
    isAdmin: true,
  },
  {
    name: 'Luke Batchelor',
    email: 'luke@voussoir.com',
    company: 'atlassian',
    isAdmin: false,
  },
  {
    name: 'Jared Crowe',
    email: 'jared@voussoir.com',
    company: 'atlassian',
    isAdmin: false,
  },
  {
    name: 'Tom Walker',
    email: 'gelato@thinkmill.com.au',
    company: 'gelato',
  },
];

const createPost = (v, i) => {
  const user = users[i % users.length];
  return {
    name: `Why ${i} is better than ${i - 1}`,
    author: { where: { email: user.email } },
    categories: { where: { name: 'Number comparison' } },
    views: i,
  };
};

module.exports = {
  Post: [
    {
      name: 'Lets talk React Router',
      author: { where: { email: 'ben@voussoir.com' } },
      categories: { where: { name_starts_with: 'React' } },
    },
    {
      name: 'Hello Things',
    },
    {
      name: 'How we built Keystone 5',
      author: { where: { email: 'jared@voussoir.com' } },
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
      .map(createPost)
  ),
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
  ],
  User: users.map(user => ({ ...user, password: 'password' })),
};
