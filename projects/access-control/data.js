const {
  listAccessVariations,
  fieldAccessVariations,
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  getFieldName,
} = require('./cypress/integration/util');

const generatedFieldData = fieldAccessVariations.reduce(
  (memo, variation) =>
    Object.assign(memo, {
      [getFieldName(variation)]: JSON.stringify(variation),
    }),
  {}
);

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
    ].map(user => Object.assign(user, { noRead: 'no', yesRead: 'yes' })),
  },
  // ensure every list has at least some data
  listAccessVariations.reduce(
    (memo, access) =>
      Object.assign(memo, {
        [getStaticListName(access)]: [
          Object.assign({ foo: 'Hello', zip: 'yo' }, generatedFieldData),
          Object.assign({ foo: 'Hi', zip: 'yo' }, generatedFieldData),
        ],
        [getImperativeListName(access)]: [
          Object.assign({ foo: 'Hello', zip: 'yo' }, generatedFieldData),
          Object.assign({ foo: 'Hi', zip: 'yo' }, generatedFieldData),
        ],
        [getDeclarativeListName(access)]: [{ foo: 'Hello', zip: 'yo' }, { foo: 'Hi', zip: 'yo' }],
      }),
    {}
  )
);
