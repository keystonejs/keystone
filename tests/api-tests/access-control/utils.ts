import { text, password } from '@keystone-next/keystone/fields';
import { createSchema, list } from '@keystone-next/keystone';
import { statelessSessions } from '@keystone-next/keystone/session';
import { createAuth } from '@keystone-next/auth';
import { apiTestConfig } from '../utils';

const FAKE_ID = { postgresql: 'cdsfasfafafadfasdf', sqlite: 'cdsfasfafafadfasdf' } as const;
const FAKE_ID_2 = { postgresql: 'csdfbstrsbaf', sqlite: 'csdfbstrsbaf' } as const;
const COOKIE_SECRET = 'qwertyuiopasdfghjlkzxcvbmnm1234567890';

const yesNo = (truthy: boolean | undefined) => (truthy ? 'Yes' : 'No');

type BooleanAccess = { create: boolean; read: boolean; update: boolean; delete?: boolean };

const getPrefix = (access: BooleanAccess) => {
  // prettier-ignore
  let prefix = `${yesNo(access.create)}Create${yesNo(access.read)}Read${yesNo(access.update)}Update`;
  if (Object.prototype.hasOwnProperty.call(access, 'delete')) {
    prefix = `${prefix}${yesNo(access.delete)}Delete`;
  }
  return prefix;
};

const getStaticListName = (access: BooleanAccess) => `${getPrefix(access)}StaticList`;
const getImperativeListName = (access: BooleanAccess) => `${getPrefix(access)}ImperativeList`;
const getDeclarativeListName = (access: BooleanAccess) => `${getPrefix(access)}DeclarativeList`;

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
const listAccessVariations: (BooleanAccess & { delete: boolean })[] = [
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

const fieldMatrix: BooleanAccess[] = [
  { create: false, read: false, update: false },
  { create: true, read: false, update: false },
  { create: false, read: true, update: false },
  { create: true, read: true, update: false },
  { create: false, read: false, update: true },
  { create: true, read: false, update: true },
  { create: false, read: true, update: true },
  { create: true, read: true, update: true },
];
const getFieldName = (access: BooleanAccess) => getPrefix(access);

const nameFn = {
  imperative: getImperativeListName,
  declarative: getDeclarativeListName,
  static: getStaticListName,
};

const createFieldStatic = (fieldAccess: BooleanAccess) => ({
  [getFieldName(fieldAccess)]: text({ access: fieldAccess }),
});
const createFieldImperative = (fieldAccess: BooleanAccess) => ({
  [getFieldName(fieldAccess)]: text({
    access: {
      create: () => fieldAccess.create,
      read: () => fieldAccess.read,
      update: () => fieldAccess.update,
    },
  }),
});

const lists = createSchema({
  User: list({
    fields: {
      name: text(),
      email: text({ isUnique: true }),
      password: password(),
      noRead: text({ access: { read: () => false } }),
      yesRead: text({ access: { read: () => true } }),
    },
  }),
});

listAccessVariations.forEach(access => {
  lists[getStaticListName(access)] = list({
    fields: Object.assign(
      {
        name: text(),
      },
      ...fieldMatrix.map(variation => createFieldStatic(variation))
    ),
    access,
  });
  lists[getImperativeListName(access)] = list({
    fields: Object.assign(
      {
        name: text(),
      },
      ...fieldMatrix.map(variation => createFieldImperative(variation))
    ),
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
      read: () => access.read && { name: { equals: 'Hello' } },
      update: () => access.update && { name: { equals: 'Hello' } },
      delete: () => access.delete && { name: { equals: 'Hello' } },
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
  getStaticListName,
  getImperativeListName,
  getDeclarativeListName,
  listAccessVariations,
  fieldMatrix,
  nameFn,
  config,
  getFieldName,
};
