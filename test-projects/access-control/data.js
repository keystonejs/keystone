const {
  listAccessVariations,
  fieldAccessVariations,
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  getFieldName,
} = require('./cypress/integration/util');

const generatedFieldData = fieldAccessVariations.reduce(
  (acc, variation) =>
    Object.assign(acc, {
      [getFieldName(variation)]: JSON.stringify(variation),
    }),
  {}
);

module.exports = Object.assign(
  {
    User: [
      {
        email: 'ticiana@voussoir.com',
        password: 'correct',
        level: 'su',
      },
      {
        email: 'boris@voussoir.com',
        password: 'battery',
        level: 'admin',
      },
      {
        email: 'jed@voussoir.com',
        password: 'horse',
        level: 'editor',
      },
      {
        email: 'john@voussoir.com',
        password: 'staple',
        level: 'writer',
      },
      {
        email: 'jess@voussoir.com',
        password: 'xkcd',
        level: 'reader',
      },
    ].map(user => Object.assign(user, { noRead: 'no', yesRead: 'yes' })),
  },
  // ensure every list has at least some data
  listAccessVariations.reduce(
    (acc, access) =>
      Object.assign(acc, {
        [getStaticListName(access)]: [
          Object.assign({ foo: 'Hello', zip: 'yo' }, generatedFieldData),
          Object.assign({ foo: 'Hi', zip: 'yo' }, generatedFieldData),
        ],
        [getImperativeListName(access)]: [
          Object.assign({ foo: 'Hello', zip: 'yo' }, generatedFieldData),
          Object.assign({ foo: 'Hi', zip: 'yo' }, generatedFieldData),
        ],
        [getDeclarativeListName(access)]: [
          { foo: 'Hello', zip: 'yo' },
          { foo: 'Hi', zip: 'yo' },
        ],
      }),
    {}
  )
);
