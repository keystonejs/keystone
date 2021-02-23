const { text, password } = require('@keystone-next/fields');
const { createSchema, list } = require('@keystone-next/keystone/schema');
const { statelessSessions, withItemData } = require('@keystone-next/keystone/session');
const { setupFromConfig } = require('@keystone-next/test-utils-legacy');
const { createAuth } = require('@keystone-next/auth');
const { objMerge } = require('@keystone-next/utils-legacy');

const FAKE_ID = { mongoose: '5b3eabd9e9f2e3e4866742ea', knex: 137, prisma: 137 };
const FAKE_ID_2 = { mongoose: '5b3eabd9e9f2e3e4866742eb', knex: 138, prisma: 138 };
const COOKIE_SECRET = 'qwertyuiopasdfghjlkzxcvbmnm1234567890';

const yesNo = truthy => (truthy ? 'Yes' : 'No');

const getPrefix = access => {
  // prettier-ignore
  let prefix = `${yesNo(access.create)}Create${yesNo(access.read)}Read${yesNo(access.update)}Update`;
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
  const options = ['create', 'read', 'update', 'delete'];
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
  { create: false, read: false, update: false, delete: false },
  { create: true, read: false, update: false, delete: false },
  { create: false, read: true, update: false, delete: false },
  { create: true, read: true, update: false, delete: false },
  { create: false, read: false, update: true, delete: false },
  { create: true, read: false, update: true, delete: false },
  { create: false, read: true, update: true, delete: false },
  { create: true, read: true, update: true, delete: false },
  { create: false, read: false, update: false, delete: true },
  { create: true, read: false, update: false, delete: true },
  { create: false, read: true, update: false, delete: true },
  { create: true, read: true, update: false, delete: true },
  { create: false, read: false, update: true, delete: true },
  { create: true, read: false, update: true, delete: true },
  { create: false, read: true, update: true, delete: true },
  { create: true, read: true, update: true, delete: true },
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

const nameFn = {
  imperative: getImperativeListName,
  declarative: getDeclarativeListName,
  static: getStaticListName,
};

const createFieldStatic = fieldAccess => ({
  [getFieldName(fieldAccess)]: text({ access: fieldAccess }),
});
const createFieldImperative = fieldAccess => ({
  [getFieldName(fieldAccess)]: text({
    access: {
      create: () => fieldAccess.create,
      read: () => fieldAccess.read,
      update: () => fieldAccess.update,
    },
  }),
});
function setupKeystone(adapterName) {
  const lists = {
    User: list({
      fields: {
        name: text(),
        email: text(),
        password: password(),
        noRead: text({ access: { read: () => false } }),
        yesRead: text({ access: { read: () => true } }),
      },
    }),
  };

  listAccessVariations.forEach(access => {
    lists[getStaticListName(access)] = list({
      fields: {
        name: text(),
        ...objMerge(fieldMatrix.map(variation => createFieldStatic(variation))),
      },
      access,
    });
    lists[getImperativeListName(access)] = list({
      fields: {
        name: text(),
        ...objMerge(fieldMatrix.map(variation => createFieldImperative(variation))),
      },
      access: {
        create: () => access.create,
        read: () => access.read,
        update: () => access.update,
        delete: () => access.delete,
      },
    });
    lists[getDeclarativeListName(access)] = list({
      fields: { name: text() },
      access: {
        create: access.create,
        // arbitrarily restrict the data to a single item (see data.js)
        read: () => access.read && { name_starts_with: 'Hello' },
        update: () => access.update && { name_starts_with: 'Hello' },
        delete: () => access.delete && { name_starts_with: 'Hello' },
      },
    });
  });
  const auth = createAuth({ listKey: 'User', identityField: 'email', secretField: 'password' });
  return setupFromConfig({
    adapterName,
    config: auth.withAuth(
      createSchema({
        lists,
        session: withItemData(statelessSessions({ secret: COOKIE_SECRET }), { User: 'id' }),
      })
    ),
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
