import { text, password } from '@keystone-next/keystone/fields';
import { list, ListSchemaConfig } from '@keystone-next/keystone';
import { statelessSessions } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';
import { apiTestConfig } from '../utils';

const FAKE_ID = 'cdsfasfafafadfasdf';
const FAKE_ID_2 = 'csdfbstrsbaf';
const COOKIE_SECRET = 'qwertyuiopasdfghjlkzxcvbmnm1234567890';

const yesNo = (truthy: boolean | undefined) => (truthy ? 'Yes' : 'No');

type BooleanAccess = { create: boolean; query: boolean; update: boolean; delete?: boolean };

const getPrefix = (access: BooleanAccess) => {
  // prettier-ignore
  let prefix = `${yesNo(access.create)}Create${yesNo(access.query)}Query${yesNo(access.update)}Update`;
  if (Object.prototype.hasOwnProperty.call(access, 'delete')) {
    prefix = `${prefix}${yesNo(access.delete)}Delete`;
  }
  return prefix;
};

// Operation tests
const getOperationListName = (access: BooleanAccess) => `${getPrefix(access)}OperationList`;

// Filter tests
const getFilterListName = (access: BooleanAccess) => `${getPrefix(access)}FilterList`;

// Filter - boolean tests
const getFilterBoolListName = (access: BooleanAccess) => `${getPrefix(access)}FilterBoolList`;

/// Item tests
const getItemListName = (access: BooleanAccess) => `${getPrefix(access)}ItemList`;

/* Generated with:
  const result = [];
  const options = ['create', 'query', 'update', 'delete'];
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
const listAccessVariations: (BooleanAccess & { delete: boolean })[] = [
  { create: false, query: false, update: false, delete: false },
  { create: true, query: false, update: false, delete: false },
  { create: false, query: true, update: false, delete: false },
  { create: true, query: true, update: false, delete: false },
  { create: false, query: false, update: true, delete: false },
  { create: true, query: false, update: true, delete: false },
  { create: false, query: true, update: true, delete: false },
  { create: true, query: true, update: true, delete: false },
  { create: false, query: false, update: false, delete: true },
  { create: true, query: false, update: false, delete: true },
  { create: false, query: true, update: false, delete: true },
  { create: true, query: true, update: false, delete: true },
  { create: false, query: false, update: true, delete: true },
  { create: true, query: false, update: true, delete: true },
  { create: false, query: true, update: true, delete: true },
  { create: true, query: true, update: true, delete: true },
];

const fieldMatrix: BooleanAccess[] = [
  { create: false, query: false, update: false },
  { create: true, query: false, update: false },
  { create: false, query: true, update: false },
  { create: true, query: true, update: false },
  { create: false, query: false, update: true },
  { create: true, query: false, update: true },
  { create: false, query: true, update: true },
  { create: true, query: true, update: true },
];
const getFieldName = (access: BooleanAccess) => getPrefix(access);

const nameFn = {
  item: getItemListName,
  filter: getFilterListName,
  filterBool: getFilterBoolListName,
  operation: getOperationListName,
};

const createFieldStatic = (fieldAccess: BooleanAccess) => ({
  [getFieldName(fieldAccess)]: text({
    access: {
      create: () => fieldAccess.create,
      read: () => fieldAccess.query,
      update: () => fieldAccess.update,
    },
  }),
});
const createFieldImperative = (fieldAccess: BooleanAccess) => ({
  [getFieldName(fieldAccess)]: text({
    access: {
      create: () => fieldAccess.create,
      read: () => fieldAccess.query,
      update: () => fieldAccess.update,
    },
  }),
});

const lists: ListSchemaConfig = {
  User: list({
    fields: {
      name: text(),
      email: text({ isIndexed: 'unique', isFilterable: true }),
      password: password(),
      noRead: text({ access: { read: () => false } }),
      yesRead: text({ access: { read: () => true } }),
    },
  }),
};

listAccessVariations.forEach(access => {
  lists[getOperationListName(access)] = list({
    fields: Object.assign(
      { name: text() },
      ...fieldMatrix.map(variation => createFieldStatic(variation))
    ),
    access: {
      operation: {
        create: () => access.create,
        query: () => access.query,
        update: () => access.update,
        delete: () => access.delete,
      },
    },
  });
  lists[getFilterListName(access)] = list({
    fields: { name: text() },
    access: {
      filter: {
        // arbitrarily restrict the data to a single item (see data.js)
        query: () => access.query && { name: { equals: 'Hello' } },
        update: () => access.update && { name: { equals: 'Hello' } },
        delete: () => access.delete && { name: { equals: 'Hello' } },
      },
    },
  });
  lists[getFilterBoolListName(access)] = list({
    fields: { name: text() },
    access: {
      filter: {
        query: () => access.query,
        update: () => access.update,
        delete: () => access.delete,
      },
    },
  });
  lists[getItemListName(access)] = list({
    fields: Object.assign(
      { name: text() },
      ...fieldMatrix.map(variation => createFieldImperative(variation))
    ),
    access: {
      item: {
        create: () => access.create,
        update: () => access.update,
        delete: () => access.delete,
      },
    },
  });
});
const auth = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id',
});

const config = auth.withAuth(
  apiTestConfig({
    lists,
    session: statelessSessions({ secret: COOKIE_SECRET }),
  })
);

export {
  FAKE_ID,
  FAKE_ID_2,
  getOperationListName,
  getItemListName,
  getFilterListName,
  getFilterBoolListName,
  listAccessVariations,
  fieldMatrix,
  nameFn,
  config,
  getFieldName,
};
