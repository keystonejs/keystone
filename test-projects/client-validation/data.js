const users = [
  {
    name: 'Boris Bozic',
    email: 'boris@keystone.com',
    isAdmin: true,
  },
  {
    name: 'Jed Watson',
    email: 'jed@keystone.com',
    isAdmin: true,
  },
  {
    name: 'John Molomby',
    email: 'john@keystone.com',
    isAdmin: true,
  },
  {
    name: 'Joss Mackison',
    email: 'joss@keystone.com',
    isAdmin: true,
  },
  {
    name: 'Ben Conolly',
    email: 'ben@keystone.com',
    isAdmin: true,
  },
  {
    name: 'Luke Batchelor',
    email: 'luke@keystone.com',
    isAdmin: false,
  },
  {
    name: 'Jared Crowe',
    email: 'jared@keystone.com',
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
