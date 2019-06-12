const users = [
  {
    name: 'Boris Bozic',
    email: 'boris@keystone-alpha.com',
    isAdmin: true,
  },
  {
    name: 'Jed Watson',
    email: 'jed@keystone-alpha.com',
    isAdmin: true,
  },
  {
    name: 'John Molomby',
    email: 'john@keystone-alpha.com',
    isAdmin: true,
  },
  {
    name: 'Joss Mackison',
    email: 'joss@keystone-alpha.com',
    isAdmin: true,
  },
  {
    name: 'Ben Conolly',
    email: 'ben@keystone-alpha.com',
    isAdmin: true,
  },
  {
    name: 'Luke Batchelor',
    email: 'luke@keystone-alpha.com',
    isAdmin: false,
  },
  {
    name: 'Jared Crowe',
    email: 'jared@keystone-alpha.com',
    isAdmin: false,
  },
  {
    name: 'Tom Walker',
    email: 'gelato@thinkmill.com.au',
  },
];

module.exports = {
  User: users.map(user => ({ ...user, password: 'password' })),
};
