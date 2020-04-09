<!--[meta]
title: Mongo Join Builder
[meta]-->

# Mongo Join Builder

Perform JOINs in Mongo with a simplified query syntax.

## Examples

Given this dataset:

```javascript
db.items.insert([
  { _id: 1, name: 'almonds', stock: [1, 3] },
  { _id: 2, name: 'pecans', stock: [2] },
  { _id: 3, name: 'cookies', stock: [4, 5] },
]);

// Only item 2 & 3 have stock. Item 2 only has stock in warehouse A.Item 3 used
// to have stock in warehouse B, but now only has stock in warehouse A.
db.warehouses.insert([
  { _id: 1, item: 1, warehouse: 'A', stock: 0 },
  { _id: 2, item: 2, warehouse: 'A', stock: 80 },
  { _id: 3, item: 1, warehouse: 'B', stock: 0 },
  { _id: 4, item: 3, warehouse: 'B', stock: 0 },
  { _id: 5, item: 3, warehouse: 'A', stock: 40 },
]);

db.orders.insert([
  { _id: 1, items: [1], price: 12, ordered: 2, fulfilled: false },
  { _id: 2, items: [2], price: 20, ordered: 1, fulfilled: false },
  { _id: 3, items: [3, 1], price: 10, ordered: 60, fulfilled: false },
  { _id: 4, items: [1], price: 10, ordered: 60, fulfilled: true },
]);
```

### Find unfulfilled orders with items containing 'a' in the name

We can write this query like so:

```javascript
{
  fulfilled: false,
  items_every: {
    name_contains: 'a'
  }
}
```

Can also be written with an explicit `AND`:

```javascript
{
  AND: [
    { fulfilled: false },
    {
      items_every: {
        name_contains: 'a',
      },
    },
  ];
}
```

We'd expect the following results:

```javascript
[
  {
    id: 1,
    items: [
      {
        id: 1,
        name: 'almonds',
        stock: [
          { id: 1, warehouse: 'A', stock: 0 },
          { id: 3, warehouse: 'B', stock: 0 },
        ],
      },
    ],
  },
  {
    id: 2,
    items: [
      {
        id: 2,
        name: 'pecans',
        stock: [{ id: 2, warehouse: 'A', stock: 80 }],
      },
    ],
  },
];
```

The raw MongoDB query to do this is complex.

<details>
<summary>See the MongoDB query</summary>

```js
db.orders.aggregate([
  {
    $match: {
      $and: [{ fulfilled: { $eq: false } }],
    },
  },
  {
    $lookup: {
      from: 'items',
      as: 'abc123_items',
      let: { tmpVar: '$items' },
      pipeline: [
        { $match: { $expr: { $eq: [`$foreignKey`, '$$tmpVar'] } } },
        { $match: { $and: [{ name: { $regex: /a/ } }] } },
        { $addFields: { id: '$_id' } },
      ],
    },
  },
  {
    $match: {
      $and: [{ abc123_items_every: { $eq: true } }],
    },
  },
  {
    $addFields: {
      id: '$_id',
    },
  },
]);
```

</details>

Instead, we can use `mongo-join-builder`!

_NOTE: This example is incomplete, and only for documentation purposes. See the examples directory for complete examples._

```javascript
const { mongoJoinBuilder } = require('@keystonejs/mongo-join-builder');
const database = require('./my-mongodb-connection');

const builder = mongoJoinBuilder({
  tokenizer: {
    // executed for simple query components (eg; 'fulfilled: false' / name: 'a')
    simple: (qyer, key, path) => ({
      // ... mongo specific syntax for filtering items
      [key]: { $eq: query[key] },
    }),

    // executed for complex query components (eg; items: { ... })
    relationship: (query, key, path, uid) => {
      return {
        from: 'items', // the collection name to join with
        field: 'items', // The field on the 'orders' collection
        // A mutation to run on the data post-join. Useful for merging joined
        // data back into the original object.
        // Executed on a depth-first basis for nested relationships.
        postQueryMutation: (parentObj, keyOfRelationship, rootObj, pathToParent) => {
          // For this example, we want the joined items to overwrite the array
          //of IDs
          return {
            ...parentObj,
            items: parentObj[keyOfRelationship],
          };
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
        match: { [`${uid}_items_every`]: true },
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
  },
};

const result = await builder(query, database, 'orders');
```

## Limitations

Due to [a limitation in `mongo@<4.x`](https://jira.mongodb.org/browse/SERVER-22781), relationship
queries will fail silently with 0 results unless IDs are stored as `ObjectId`s.
