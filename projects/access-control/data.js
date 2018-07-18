const {
  accessCombinations,
  getStaticListName,
  getDynamicListName,
  getDynamicForAdminOnlyListName,
} = require('./cypress/integration/util');

module.exports = Object.assign(
  {
    User: [
      {
        email: 'ticiana@keystonejs.com',
        password: 'correct',
        level: 'su',
      },
      {
        email: 'boris@keystonejs.com',
        password: 'battery',
        level: 'admin',
      },
      {
        email: 'jed@keystonejs.com',
        password: 'horse',
        level: 'editor',
      },
      {
        email: 'john@keystonejs.com',
        password: 'staple',
        level: 'writer',
      },
      {
        email: 'jess@keystonejs.com',
        password: 'xkcd',
        level: 'reader',
      },
    ],

    Post: [
      {
        title: 'Hello',
        status: 'draft',
        author: { where: { email: 'ticiana@keystonejs.com' } },
      },
      {
        title: 'Hellwhoa',
        status: 'deleted',
        author: { where: { email: 'boris@keystonejs.com' } },
      },
      {
        title: 'Aloha',
        status: 'published',
        author: { where: { email: 'jed@keystonejs.com' } },
      },
      {
        title: 'Salut',
        status: 'published',
        author: { where: { email: 'john@keystonejs.com' } },
      },
      {
        title: 'Bonjour',
        status: 'published',
        author: { where: { email: 'jess@keystonejs.com' } },
      },
      {
        title: "G'day",
        status: 'draft',
        author: { where: { email: 'jess@keystonejs.com' } },
      },
    ],

    Audit: [
      {
        user: { where: { email: 'jed@keystonejs.com' } },
        post: { where: { title: 'Aloha' } },
        action: 'edit',
      },
      {
        user: { where: { email: 'jess@keystonejs.com' } },
        post: { where: { title: 'Bonjour' } },
        action: 'changestatus',
      },
      {
        user: { where: { email: 'boris@keystonejs.com' } },
        post: { where: { title: 'Hellwhoa' } },
        action: 'delete',
      },
      {
        user: { where: { email: 'jess@keystonejs.com' } },
        post: { where: { title: "G'day" } },
        action: 'create',
      },
    ],
  },
  // ensure every list has at least some data
  accessCombinations.reduce(
    (memo, access) =>
      Object.assign(memo, {
        [getStaticListName(access)]: [{ foo: 'Hello' }, { foo: 'Hi' }],
        [getDynamicListName(access)]: [{ foo: 'Hello' }, { foo: 'Hi' }],
        [getDynamicForAdminOnlyListName(access)]: [
          { foo: 'Hello' },
          { foo: 'Hi' },
        ],
      }),
    {}
  )
);
