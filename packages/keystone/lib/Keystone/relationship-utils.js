const { resolveAllKeys, mapKeys } = require('@keystonejs/utils');

function isRelationshipField({ list, fieldKey }) {
  return !!list._fields[fieldKey].type.isRelationship;
}

function isManyRelationship({ list, fieldKey }) {
  const field = list._fields[fieldKey];
  return !!field.type.isRelationship && field.many;
}

function splitObject(input, filterFn) {
  const left = {};
  const right = {};
  Object.keys(input).forEach(key => {
    if (filterFn(input[key], key, input)) {
      left[key] = input[key];
    } else {
      right[key] = input[key];
    }
  });
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
 *       author: { where: { ... } }
 *     },
 *     {
 *       id: "def789",
 *       title: "Hello",
 *       author: { where: { ... } }
 *     },
 *   ]
 * }
 *
 * @returns {Object}
 * {
 *   data: {
 *     Posts: [
 *       { id: "abc123", title: "Foobar" },
 *       { id: "def789", title: "Hello" },
 *     ]
 *   },
 *   relationships: {
 *     Posts: {
 *       0: { author: { where: { ... } } },
 *       7: { author: { where: { ... } } },
 *     }
 *   }
 * }
 */
const unmergeRelationships = (lists, input) => {
  const relationships = {};

  // I think this is easier to read (ง'-')ง
  // prettier-ignore
  const data = mapKeys(input, (listData, listKey) => listData.map((item, itemIndex) => {
    const { left: relationData, right: scalarData } = splitObject(item, (fieldConditions, fieldKey) => {
      const list = lists[listKey];
      if (isRelationshipField({ list, fieldKey })) {
        // Array syntax can only be used with many-relationship fields
        if (Array.isArray(fieldConditions) && !isManyRelationship({ list, fieldKey })) {
          throw new Error(`Attempted to relate many items to ${list.key}[${itemIndex}].${fieldKey}, but ${list.key}.${fieldKey} is configured as a single Relationship.`);
        }
        return true;
      }

      return false;
    });

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

const relateTo = async ({ relatedTo, relatedFrom }) => {
  if (isManyRelationship({ list: relatedFrom.list, fieldKey: relatedFrom.field })) {
    return relateToManyItems({ relatedTo, relatedFrom });
  } else {
    return relateToOneItem({ relatedTo, relatedFrom });
  }
};

const throwRelateError = ({ relatedTo, relatedFrom, isMany }) => {
  // I know it's long, but you're making this weird.
  // prettier-ignore
  throw new Error(`Attempted to relate ${relatedFrom.list.key}<${relatedFrom.item.id}>.${relatedFrom.field} to${isMany ? '' : ' a'} ${relatedTo.list.key}, but no ${relatedTo.list.key} matched the conditions ${JSON.stringify({ conditions: relatedTo.conditions })}`);
};

const relateToOneItem = async ({ relatedTo, relatedFrom }) => {
  // Use where clause provided in original data to find related item
  const relatedToItems = await relatedTo.list.adapter.itemsQuery(relatedTo.conditions);

  // Sanity checking
  if (!relatedToItems || !relatedToItems.length) {
    throwRelateError({ relatedTo, relatedFrom, isMany: false });
  }

  const updateResult = await relatedFrom.list.adapter.update(relatedFrom.item.id, {
    [relatedFrom.field]: relatedToItems[0].id,
  });

  return updateResult[relatedFrom.field];
};

const relateToManyItems = async ({ relatedTo, relatedFrom }) => {
  let relatedToItems;

  if (Array.isArray(relatedTo.conditions)) {
    // Use where clause provided in original data to find related item
    relatedToItems = await Promise.all(
      relatedTo.conditions.map(condition => relatedTo.list.adapter.itemsQuery(condition))
    );

    // Grab the first result of each
    relatedToItems = relatedToItems.map(items => items[0]);

    // One of them didn't match
    if (relatedToItems.some(item => !item)) {
      throwRelateError({ relatedTo, relatedFrom, isMany: true });
    }
  } else {
    // Use where clause provided in original data to find related item
    relatedToItems = await relatedTo.list.adapter.itemsQuery(relatedTo.conditions);
  }

  // Sanity checking
  if (!relatedToItems) {
    throwRelateError({ relatedTo, relatedFrom, isMany: true });
  }

  const updateResult = await relatedFrom.list.adapter.update(relatedFrom.item.id, {
    [relatedFrom.field]: relatedToItems.map(({ id }) => id),
  });

  return updateResult[relatedFrom.field];
};

/**
 * @param lists {Object} The lists object from keyston
 * @param relationships {Object} Is an object of sparse arrays containing
 * fields that have where clauses. ie;
 * {
 *   Posts: {
 *     0: { author: { where: { ... } } },
 *     7: { author: { where: { ... } } },
 *   }
 * }
 *
 * @param createdItems {Object} is an object of arrays containing items
 * created with no relationships. ie;
 * {
 *   Users: [
 *     { id: "456zyx", name: "Jess" },
 *     { id: "789wer", name: "Jed" },
 *   ],
 *   Posts: [
 *     { id: "abc123", title: "Foobar" },
 *     { id: "def789", title: "Hello" },
 *   ]
 * }
 *
 * @returns {Object} an object of sparse arrays containing fields that have
 * ids of related items. ie;
 * {
 *   Posts: {
 *     0: { author: "456zyx" },
 *     7: { author: "789wer" },
 *   }
 * }
 */
const createRelationships = (lists, relationships, createdItems) => {
  return resolveAllKeys(
    mapKeys(relationships, (relationList, listKey) => {
      const listFieldsConfig = lists[listKey]._fields;

      return resolveAllKeys(
        // NOTE: Sparse array / indexes match the indexes from the `createdItems`
        mapKeys(relationList, (relationItem, relationItemIndex) => {
          const createdItem = createdItems[listKey][relationItemIndex];

          // Results in something like:
          // Promise<{ author: <id-of-User>, ... }>
          return resolveAllKeys(
            mapKeys(relationItem, (relationConditions, relationshipField) => {
              const relatedListKey = listFieldsConfig[relationshipField].ref.split('.')[0];

              return relateTo({
                relatedFrom: {
                  list: lists[listKey],
                  item: createdItem,
                  field: relationshipField,
                },
                relatedTo: {
                  list: lists[relatedListKey],
                  conditions: relationConditions,
                },
              });
            })
          );
        })
      );
    })
  );
};

function mergeRelationships(created, relationships) {
  return mapKeys(created, (newList, listKey) => {
    const relationshipItems = relationships[listKey];

    if (relationshipItems) {
      newList = newList.map((item, itemIndex) => ({
        ...item,
        ...relationshipItems[itemIndex],
      }));
    }
    return newList;
  });
}

module.exports = {
  unmergeRelationships,
  createRelationships,
  mergeRelationships,
};
