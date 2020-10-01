const { setupServer } = require('@keystonejs/test-utils');
const { Text } = require('@keystonejs/fields');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { objMerge } = require('@keystonejs/utils');

const FAKE_ID = { mongoose: '5b3eabd9e9f2e3e4866742ea', knex: 137, prisma: 137 };
const FAKE_ID_2 = { mongoose: '5b3eabd9e9f2e3e4866742eb', knex: 138, prisma: 138 };

const yesNo = truthy => (truthy ? 'Yes' : 'No');

const getPrefix = access => {
  // prettier-ignore
  let prefix = `${yesNo(access.create)}Create${yesNo(access.read)}Read${yesNo(access.update)}Update${yesNo(access.auth)}Auth`;
  if (Object.prototype.hasOwnProperty.call(access, 'delete')) {
    prefix = `${prefix}${yesNo(access.delete)}Delete`;
  }
  return prefix;
};

const getStaticListName = access => `${getPrefix(access)}StaticList`;
const getImperativeListName = access => `${getPrefix(access)}ImperativeList`;
const getDeclarativeListName = access => `${getPrefix(access)}DeclarativeList`;

/* Generated with:
  const result = [];
  const options = ['create', 'read', 'update', 'delete', 'auth'];
  // All possible combinations are contained in the set 0..2^n-1
  for(let flags = 0; flags < Math.pow(2, options.length); flags++) {
    // Generate an object of true/false values for the particular combination
    result.push(options.reduce((memo, option, index) => ({
      ...memo,
      // Use a bit mask to see if that bit is set
      [option]: !!(flags & (1 << index)),
    }), {}));
  }
  */
const listAccessVariations = [
  { create: false, read: false, update: false, delete: false, auth: true },
  { create: true, read: false, update: false, delete: false, auth: true },
  { create: false, read: true, update: false, delete: false, auth: true },
  { create: true, read: true, update: false, delete: false, auth: true },
  { create: false, read: false, update: true, delete: false, auth: true },
  { create: true, read: false, update: true, delete: false, auth: true },
  { create: false, read: true, update: true, delete: false, auth: true },
  { create: true, read: true, update: true, delete: false, auth: true },
  { create: false, read: false, update: false, delete: true, auth: true },
  { create: true, read: false, update: false, delete: true, auth: true },
  { create: false, read: true, update: false, delete: true, auth: true },
  { create: true, read: true, update: false, delete: true, auth: true },
  { create: false, read: false, update: true, delete: true, auth: true },
  { create: true, read: false, update: true, delete: true, auth: true },
  { create: false, read: true, update: true, delete: true, auth: true },
  { create: true, read: true, update: true, delete: true, auth: true },
  { create: false, read: false, update: false, delete: false, auth: false },
  { create: true, read: false, update: false, delete: false, auth: false },
  { create: false, read: true, update: false, delete: false, auth: false },
  { create: true, read: true, update: false, delete: false, auth: false },
  { create: false, read: false, update: true, delete: false, auth: false },
  { create: true, read: false, update: true, delete: false, auth: false },
  { create: false, read: true, update: true, delete: false, auth: false },
  { create: true, read: true, update: true, delete: false, auth: false },
  { create: false, read: false, update: false, delete: true, auth: false },
  { create: true, read: false, update: false, delete: true, auth: false },
  { create: false, read: true, update: false, delete: true, auth: false },
  { create: true, read: true, update: false, delete: true, auth: false },
  { create: false, read: false, update: true, delete: true, auth: false },
  { create: true, read: false, update: true, delete: true, auth: false },
  { create: false, read: true, update: true, delete: true, auth: false },
  { create: true, read: true, update: true, delete: true, auth: false },
];

const fieldMatrix = [
  { create: false, read: false, update: false },
  { create: true, read: false, update: false },
  { create: false, read: true, update: false },
  { create: true, read: true, update: false },
  { create: false, read: false, update: true },
  { create: true, read: false, update: true },
  { create: false, read: true, update: true },
  { create: true, read: true, update: true },
];
const getFieldName = access => getPrefix(access);

const nameFn = { imperative: getImperativeListName, declarative: getDeclarativeListName };

const createFieldStatic = fieldAccess => ({
  [getFieldName(fieldAccess)]: {
    type: Text,
    access: fieldAccess,
  },
});
const createFieldImperative = fieldAccess => ({
  [getFieldName(fieldAccess)]: {
    type: Text,
    access: {
      create: () => fieldAccess.create,
      read: () => fieldAccess.read,
      update: () => fieldAccess.update,
    },
  },
});
function setupKeystone(adapterName) {
  return setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('User', { fields: { name: { type: Text } } });

      listAccessVariations.forEach(access => {
        keystone.createList(getStaticListName(access), {
          fields: {
            name: { type: Text },
            ...objMerge(fieldMatrix.map(variation => createFieldStatic(variation))),
          },
          access,
        });
        if (access.auth) {
          keystone.createAuthStrategy({
            type: PasswordAuthStrategy,
            list: getStaticListName(access),
            config: {},
          });
        }
        keystone.createList(getImperativeListName(access), {
          fields: {
            name: { type: Text },
            ...objMerge(fieldMatrix.map(variation => createFieldImperative(variation))),
          },
          access: {
            create: () => access.create,
            read: () => access.read,
            update: () => access.update,
            delete: () => access.delete,
            auth: () => access.auth,
          },
        });
        keystone.createList(getDeclarativeListName(access), {
          fields: { name: { type: Text } },
          access: {
            create: access.create,
            // arbitrarily restrict the data to a single item (see data.js)
            read: () => access.read && { name_starts_with: 'Hello' },
            update: () => access.update && { name_starts_with: 'Hello' },
            delete: () => access.delete && { name_starts_with: 'Hello' },
            auth: access.auth,
          },
        });
      });
    },
  });
}
module.exports = {
  FAKE_ID,
  FAKE_ID_2,
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  listAccessVariations,
  fieldMatrix,
  nameFn,
  setupKeystone,
  getFieldName,
};
