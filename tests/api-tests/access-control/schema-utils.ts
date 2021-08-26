import { relationship, text } from '@keystone-next/keystone/fields';
import { createSchema, list } from '@keystone-next/keystone';
import { statelessSessions } from '@keystone-next/keystone/session';
import { apiTestConfig } from '../utils';

const COOKIE_SECRET = 'qwertyuiopasdfghjlkzxcvbmnm1234567890';

const yesNo = (truthy: boolean | undefined) => (truthy ? 'Yes' : 'No');

type ListEnabled =
  | undefined
  | boolean
  | { query: boolean; create: boolean; update: boolean; delete: boolean };

type FieldEnabled = {
  read: boolean;
  create: boolean;
  update: boolean;
  filter: boolean;
  orderBy: boolean;
};

const getListPrefix = (isEnabled: ListEnabled) => {
  if (isEnabled === undefined) {
    return 'Undefined';
  } else if (isEnabled === true) {
    return 'True';
  } else if (isEnabled === false) {
    return 'False';
  } else {
    // prettier-ignore
    return `${yesNo(isEnabled.create)}Create${yesNo(isEnabled.query)}Query${yesNo(isEnabled.update)}Update${yesNo(isEnabled.delete)}Delete`;
  }
};

const getListName = (isEnabled: ListEnabled) => `${getListPrefix(isEnabled)}List`;

/* Generated with:
  const result = [];
  const options = ['read', 'create', 'update', 'filter', 'orderBy'];
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
const listEnabledVariations: ListEnabled[] = [
  undefined,
  true,
  false,
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

const fieldMatrix: FieldEnabled[] = [
  { read: false, create: false, update: false, filter: false, orderBy: false },
  { read: true, create: false, update: false, filter: false, orderBy: false },
  { read: false, create: true, update: false, filter: false, orderBy: false },
  { read: true, create: true, update: false, filter: false, orderBy: false },
  { read: false, create: false, update: true, filter: false, orderBy: false },
  { read: true, create: false, update: true, filter: false, orderBy: false },
  { read: false, create: true, update: true, filter: false, orderBy: false },
  { read: true, create: true, update: true, filter: false, orderBy: false },
  { read: false, create: false, update: false, filter: true, orderBy: false },
  { read: true, create: false, update: false, filter: true, orderBy: false },
  { read: false, create: true, update: false, filter: true, orderBy: false },
  { read: true, create: true, update: false, filter: true, orderBy: false },
  { read: false, create: false, update: true, filter: true, orderBy: false },
  { read: true, create: false, update: true, filter: true, orderBy: false },
  { read: false, create: true, update: true, filter: true, orderBy: false },
  { read: true, create: true, update: true, filter: true, orderBy: false },
  { read: false, create: false, update: false, filter: false, orderBy: true },
  { read: true, create: false, update: false, filter: false, orderBy: true },
  { read: false, create: true, update: false, filter: false, orderBy: true },
  { read: true, create: true, update: false, filter: false, orderBy: true },
  { read: false, create: false, update: true, filter: false, orderBy: true },
  { read: true, create: false, update: true, filter: false, orderBy: true },
  { read: false, create: true, update: true, filter: false, orderBy: true },
  { read: true, create: true, update: true, filter: false, orderBy: true },
  { read: false, create: false, update: false, filter: true, orderBy: true },
  { read: true, create: false, update: false, filter: true, orderBy: true },
  { read: false, create: true, update: false, filter: true, orderBy: true },
  { read: true, create: true, update: false, filter: true, orderBy: true },
  { read: false, create: false, update: true, filter: true, orderBy: true },
  { read: true, create: false, update: true, filter: true, orderBy: true },
  { read: false, create: true, update: true, filter: true, orderBy: true },
  { read: true, create: true, update: true, filter: true, orderBy: true },
];

const getFieldPrefix = (isEnabled: FieldEnabled) => {
  // prettier-ignore
  return `${yesNo(isEnabled.read)}Read${yesNo(isEnabled.create)}Create${yesNo(isEnabled.update)}Update${yesNo(isEnabled.filter)}Filter${yesNo(isEnabled.orderBy)}OrderBy`;
};

const getFieldName = (isEnabled: FieldEnabled) => getFieldPrefix(isEnabled);

const createFieldStatic = (isEnabled: FieldEnabled) => ({
  [getFieldName(isEnabled)]: text({ graphql: { isEnabled } }),
});

const createRelatedFields = (isEnabled: ListEnabled) => ({
  [`${getListPrefix(isEnabled)}one`]: relationship({ ref: getListName(isEnabled), many: false }),
  [`${getListPrefix(isEnabled)}many`]: relationship({ ref: getListName(isEnabled), many: true }),
});

const lists = createSchema({});

listEnabledVariations.forEach(isEnabled => {
  lists[getListName(isEnabled)] = list({
    fields: Object.assign(
      { name: text() },
      ...fieldMatrix.map(variation => createFieldStatic(variation))
    ),
    graphql: { isEnabled },
  });
});

lists.RelatedToAll = list({
  fields: Object.assign(
    {},
    ...listEnabledVariations.map(variation => createRelatedFields(variation))
  ),
});

const config = apiTestConfig({
  lists,
  session: statelessSessions({ secret: COOKIE_SECRET }),
});

export { getListName, listEnabledVariations, fieldMatrix, getFieldName, config };
