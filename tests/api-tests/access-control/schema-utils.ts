import { relationship, text } from '@keystone-6/core/fields';
import { list, ListSchemaConfig } from '@keystone-6/core';
import { statelessSessions } from '@keystone-6/core/session';
import { allowAll } from '@keystone-6/core/access';
import { apiTestConfig } from '../utils';

const COOKIE_SECRET = 'qwertyuiopasdfghjlkzxcvbmnm1234567890';

const yesNo = (x: boolean | undefined) => (x === true ? 'Y' : x === false ? 'N' : 'U');

type ListConfig = {
  isFilterable?: false;
  isOrderable?: false;
  omit?:
    | true
    | {
        query?: boolean;
        create?: boolean;
        update?: boolean;
        delete?: boolean;
      };
};

type FieldConfig = {
  isFilterable?: false;
  isOrderable?: false;
  omit?:
    | true
    | {
        read: boolean;
        create: boolean;
        update: boolean;
      };
};

const getListPrefix = ({ isFilterable, isOrderable, omit }: ListConfig) => {
  const s = `${yesNo(isFilterable)}F${yesNo(isOrderable)}O`;
  if (omit === undefined) {
    return `${s}Undefined`;
  } else if (omit === true) {
    return `${s}True`;
  } else {
    // prettier-ignore
    return `${s}${yesNo(omit.create)}C${yesNo(omit.query)}Q${yesNo(omit.update)}U${yesNo(omit.delete)}D`;
  }
};
const getFieldPrefix = ({ isFilterable, isOrderable, omit }: FieldConfig) => {
  const s = `${yesNo(isFilterable)}Filter${yesNo(isOrderable)}Order`;
  if (omit === undefined) {
    return `${s}Undefined`;
  } else if (omit === true) {
    return `${s}True`;
  } else {
    // prettier-ignore
    return `${s}${yesNo(omit.read)}Read${yesNo(omit.create)}Create${yesNo(omit.update)}Update`;
  }
};

const getListName = (config: ListConfig) => `${getListPrefix(config)}List`;
const getFieldName = (config: FieldConfig) => getFieldPrefix(config);

const listConfigVariables: ListConfig[] = [];
for (const isFilterable of [undefined, false as const]) {
  for (const isOrderable of [undefined, false as const]) {
    for (const flag of [undefined, true, false]) {
      if (flag === undefined || flag === true) {
        listConfigVariables.push({ isFilterable, isOrderable, omit: flag });
      } else {
        for (const query of [undefined, 'query']) {
          for (const create of [undefined, 'create']) {
            for (const update of [undefined, 'update']) {
              for (const _delete of [undefined, 'delete']) {
                const omit = [query, create, update, _delete].filter(x => x) as ListConfig['omit'];
                listConfigVariables.push({ isFilterable, isOrderable, omit });
              }
            }
          }
        }
      }
    }
  }
}

const fieldMatrix: FieldConfig[] = [];
for (const isFilterable of [undefined, false as const]) {
  for (const isOrderable of [undefined, false as const]) {
    for (const flag of [undefined, true, false]) {
      if (flag === undefined || flag === true) {
        fieldMatrix.push({ isFilterable, isOrderable, omit: flag });
      } else {
        for (const read of [false, true]) {
          for (const create of [false, true]) {
            for (const update of [false, true]) {
              fieldMatrix.push({
                isFilterable,
                isOrderable,
                omit: {
                  read,
                  create,
                  update,
                },
              });
            }
          }
        }
      }
    }
  }
}

const createFieldStatic = (config: FieldConfig) => ({
  [getFieldName(config)]: text({
    graphql: { omit: config.omit },
    isFilterable: config.isFilterable,
    isOrderable: config.isOrderable,
  }),
});

const createRelatedFields = (config: ListConfig) => ({
  [`${getListPrefix(config)}one`]: relationship({ ref: getListName(config), many: false }),
  [`${getListPrefix(config)}many`]: relationship({ ref: getListName(config), many: true }),
});

const lists: ListSchemaConfig = {};

listConfigVariables.forEach(config => {
  lists[getListName(config)] = list({
    access: allowAll,
    fields: Object.assign(
      { name: text() },
      ...fieldMatrix.map(variation => createFieldStatic(variation))
    ),
    defaultIsFilterable: config.isFilterable,
    defaultIsOrderable: config.isOrderable,
    graphql: { omit: config.omit },
  });
});

lists.RelatedToAll = list({
  access: allowAll,
  fields: Object.assign({}, ...listConfigVariables.map(config => createRelatedFields(config))),
});

const config = apiTestConfig({
  lists,
  session: statelessSessions({ secret: COOKIE_SECRET }),
  ui: {
    isAccessAllowed: () => true,
  },
});

export { getListName, listConfigVariables, fieldMatrix, getFieldName, config };
