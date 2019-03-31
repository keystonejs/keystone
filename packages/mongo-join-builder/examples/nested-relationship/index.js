const omitBy = require('lodash.omitby');

const { mongoJoinBuilder } = require('../../');
const getDatabase = require('../database');

const builder = mongoJoinBuilder({
  tokenizer: {
    // executed for simple query components (eg; 'fulfilled: false' / name: 'a')
    // eslint-disable-next-line no-unused-vars
    simple: (query, key, path) => [{ [key]: { $eq: query[key] } }],

    // executed for complex query components (eg; items: { ... })
    relationship: (query, key, path, uid) => {
      const [field, filter] = key.split('_');

      const fieldToTableMap = {
        items: 'items',
        stock: 'warehouses',
      };

      return {
        from: fieldToTableMap[field], // the collection name to join with
        field: field, // The field on the 'orders' collection
        // A mutation to run on the data post-join. Useful for merging joined
        // data back into the original object.
        // Executed on a depth-first basis for nested relationships.
        // eslint-disable-next-line no-unused-vars
        postQueryMutation: (parentObj, keyOfRelationship, rootObj, pathToParent) => {
          // For this example, we want the joined items to overwrite the array
          //of IDs
          return omitBy(
            {
              ...parentObj,
              [field]: parentObj[keyOfRelationship],
            },
            // Clean up the result to remove the intermediate results
            (_, keyToOmit) => keyToOmit.startsWith(uid)
          );
        },
        // The conditions under which an item from the 'orders' collection is
        // considered a match and included in the end result
        // All the keys on an 'order' are available, plus 3 special keys:
        // 1) <uid>_<field>_every - is `true` when every joined item matches the
        //    query
        // 2) <uid>_<field>_some - is `true` when some joined item matches the
        //    query
        // 3) <uid>_<field>_none - is `true` when none of the joined items match
        //    the query
        matchTerm: { [`${uid}_${field}_${filter}`]: true },
        // Flag this is a to-many relationship
        many: true,
      };
    },
  },
});

// Get all unfulfilled orders that have some out of stock items
const query = {
  fulfilled: false,
  items_some: {
    // NOTE: This relation query will filter the items returned to only those
    // that have no stock. ie; the order may have more items in it than the
    // result we get back because we've filtered for only items that have 0
    // stock.
    stock_every: {
      instock: 0,
    },
  },
};

(async () => {
  const database = await getDatabase();

  try {
    const result = await builder(query, getAggregate(database, 'orders'));
    console.log('orders:', prettyPrintResults(result));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  // necessary to kill the in-memory mongodb instance
  process.exit(0);
})();

function prettyPrintResults(result) {
  return require('util').inspect(result, { compact: false, colors: true, depth: null });
}

function getAggregate(database, collection) {
  return pipeline => {
    return new Promise((resolve, reject) => {
      database.collection(collection).aggregate(pipeline, (error, cursor) => {
        if (error) {
          return reject(error);
        }
        return resolve(cursor.toArray());
      });
    });
  };
}
