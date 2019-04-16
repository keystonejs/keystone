const omitBy = require('lodash.omitby');

const { mongoJoinBuilder } = require('../../');
const getDatabase = require('../database');

const builder = mongoJoinBuilder({
  tokenizer: {
    // executed for simple query components (eg; 'fulfilled: false' / name: 'a')
    simple: (query, key, path) => {
      if (path[0] === 'fulfilled') {
        return [
          {
            // for the fulfilled clause, we want a direct equality check
            [key]: { $eq: query[key] },
          },
        ];
      } else {
        return [
          {
            // in this example, we want an 'in' check, so we use a regex
            [key]: { $regex: new RegExp(query[key]) },
          },
        ];
      }
    },

    // executed for complex query components (eg; items: { ... })
    relationship: (query, key, path, uid) => {
      const fieldToTableMap = {
        items: 'items',
        stock: 'warehouses',
      };

      return {
        from: fieldToTableMap[key], // the collection name to join with
        field: key, // The field on the 'orders' collection
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
              [key]: parentObj[keyOfRelationship],
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
        matchTerm: { [`${uid}_${key}_every`]: true },
        // Flag this is a to-many relationship
        many: true,
      };
    },
  },
});

const query = {
  fulfilled: false,
  items: {
    name: 'a',
    stock: {},
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
