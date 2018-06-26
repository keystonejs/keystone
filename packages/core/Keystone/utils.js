const { resolveAllKeys } = require('@keystonejs/utils');
const { Relationship } = require('@keystonejs/fields');

function isRelationshipField(field) {
  return field.type === Relationship;
}

function mapObject(input, mapFn) {
  return Object.keys(input).reduce(
    (memo, key) => ({
      ...memo,
      [key]: mapFn(input[key], key, input),
    }),
    {}
  );
}

function splitObject(input, filterFn) {
  const left = {};
  const right = {};
  Object.keys(input).forEach(
    key => {
      if (filterFn(input[key], key, input)) {
        left[key] = input[key];
      } else {
        right[key] = input[key];
      }
    }
  );
  return { left, right };
}

/*
 * Splits out the input data into relationships and non-relationships data
 *
 * @param input {Object} An object of arrays of data to insert
 * {
 *   Posts: [
 *     {
 *       id: "abc123",
 *       title: "Foobar",
 *       author: {
 *         where: { ... }
 *       }
 *     },
 *     {
 *       id: "def789",
 *       title: "Hello",
 *       author: {
 *         where: { ... }
 *       }
 *     },
 *   ]
 * }
 *
 *
 * @returns {Object}
 * {
 *   data: {
 *     Posts: [
 *       {
 *         id: "abc123",
 *         title: "Foobar",
 *       },
 *       {
 *         id: "def789",
 *         title: "Hello",
 *       },
 *     ]
 *   },
 *   relationships: {
 *     Posts: {
 *       0: {
 *         author: {
 *           where: { ... }
 *         }
 *       },
 *       7: {
 *         author: {
 *           where: { ... }
 *         }
 *       },
 *     }
 *   }
 * }
 */
const unmergeRelationships = (lists, input) => {
  const relationships = {};

  // Each list
  const data = mapObject(input, (listData, listKey) => listData.map((item, itemIndex) => {
    const { left: relationData, right: scalarData } = splitObject(item, (_, fieldKey) => (
      isRelationshipField(lists[listKey].config.fields[fieldKey])
    ));

    if (Object.keys(relationData).length) {
      // Create a sparse array using an object
      relationships[listKey] = relationships[listKey] || {};
      relationships[listKey][itemIndex] = relationData;
    }

    return scalarData;
  }));

  return {
    relationships,
    data,
  };
};

const relateToItem = async ({ relatedTo, relatedFrom }) => {

  // Use where clause provided in original data to find related item
  const relatedToItem = await relatedTo.list.adapter.findOne(relatedTo.where);

  // Sanity checking
  if (!relatedToItem) {
    throw new Error(`Attempted to relate ${relatedFrom.list.key}<${relatedFrom.item.id}>.${relatedFrom.field} to a ${relatedTo.list.key}, but no ${relatedTo.list.key} matched the conditions ${JSON.stringify({ where: relatedTo.where })}`);
  }

  //throw new Error('How do I handle 0, 1, n items?');
  const updateResult = await relatedFrom.list.adapter.update(
    relatedFrom.item.id,
    {
      // TODO: Don't hardcode first index?
      [relatedFrom.field]: relatedToItem.id,
    }
  );

  return updateResult[relatedFrom.field];
};

/**
 * @param lists {Object} The lists object from keyston
 * @param relationships {Object} Is an object of sparse arrays containing
 * fields that have where clauses. ie;
 * {
 *   Posts: {
 *     0: {
 *       author: {
 *         where: { ... }
 *       }
 *     },
 *     7: {
 *       author: {
 *         where: { ... }
 *       }
 *     },
 *   }
 * }
 *
 * @param createdItems {Object} is an object of arrays containing items
 * created with no relationships. ie;
 * {
 *   Users: [
 *     {
 *       id: "456zyx",
 *       name: "Jess",
 *     },
 *     {
 *       id: "789wer",
 *       name: "Jed",
 *     },
 *   ],
 *   Posts: [
 *     {
 *       id: "abc123",
 *       title: "Foobar",
 *     },
 *     {
 *       id: "def789",
 *       title: "Hello",
 *     },
 *   ]
 * }
 *
 * @returns {Object} an object of sparse arrays containing fields that have
 * ids of related items. ie;
 * {
 *   Posts: {
 *     0: {
 *       author: "456zyx",
 *     },
 *     7: {
 *       author: "789wer",
 *     },
 *   }
 * }
 */
const createRelationships = (lists, relationships, createdItems) => {
  return resolveAllKeys(
    mapObject(relationships, (relationList, listKey) => {
      const listFieldsConfig = lists[listKey].config.fields;

      return resolveAllKeys(
        // NOTE: Sparse array / indexes match the indexes from the `createdItems`
        mapObject(relationList, (relationItem, relationItemIndex) => {
          const createdItem = createdItems[listKey][relationItemIndex];

          // Results in something like:
          // Promise<{ author: <id-of-User>, ... }>
          return resolveAllKeys(
            mapObject(relationItem, ({ where }, relationshipField) => {
              const relatedListKey = listFieldsConfig[relationshipField].ref;

              return relateToItem({
                relatedFrom: {
                  list: lists[listKey],
                  item: createdItem,
                  field: relationshipField,
                },
                relatedTo: {
                  list: lists[relatedListKey],
                  where,
                },
              });
            })
          );
        })
      );
    })
  );
};

function mergeRelationships (created, relationships) {
  return Object.keys(created).reduce(
    (memo, listKey) => {
      const relationshipItems = relationships[listKey];

      let newList = created[listKey];

      if (relationshipItems) {
        newList = newList.map((item, itemIndex) => ({
          ...item,
          ...relationshipItems[itemIndex],
        }));
      }

      return {
        ...memo,
        [listKey]: newList,
      };
    },
    {}
  );
};

module.exports = {
  unmergeRelationships,
  createRelationships,
  mergeRelationships,
};
