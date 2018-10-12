const mongoJoinBuilder = require('../');

const { MongoClient } = require('mongodb');
const MongoDBMemoryServer = require('mongodb-memory-server').default;

function getAggregate(database, collection) {
  return joinQuery => {
    return new Promise((resolve, reject) => {
      database.collection(collection).aggregate(joinQuery, (error, cursor) => {
        if (error) {
          return reject(error);
        }
        return resolve(cursor.toArray());
      });
    });
  };
}

let mongoConnection;
let mongoDb;
let mongoServer;

// `mongodb-memory-server` downloads a binary on first run in CI, which can take
// a while, so we bump up the timeout here.
jest.setTimeout(60000);

beforeAll(async () => {
  mongoServer = new MongoDBMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  mongoConnection = await MongoClient.connect(
    mongoUri,
    { useNewUrlParser: true }
  );
  mongoDb = mongoConnection.db(await mongoServer.getDbName());
});

afterAll(() => {
  mongoConnection.close();
  mongoServer.stop();
});

beforeEach(async () => {
  const collections = await mongoDb.collections();
  await Promise.all(collections.map(collection => collection.remove({})));
});

describe('mongo memory servier is alive', () => {
  it('should start mongo server', async () => {
    const collection = mongoDb.collection('heartbeat');
    const result = await collection.insertMany([{ a: 1 }, { b: 1 }]);
    expect(result.result).toMatchObject({ n: 2, ok: 1 });
    expect(await collection.countDocuments({})).toBe(2);
  });
});

describe('Testing against real data', () => {
  test('performs simple queries', async () => {
    const tokenizer = {
      simple: jest.fn((query, key) => ({
        pipeline: [
          {
            [key]: { $eq: query[key] },
          },
        ],
      })),
      relationship: jest.fn((query, key) => {
        const [table] = key.split('_');
        return {
          from: `${table}-collection`,
          field: table,
          // called with (parentValue, keyOfRelationship, rootObject, path)
          postQueryMutation: () => {},
          match: { $exists: true, $ne: [] },
          many: true,
        };
      }),
    };

    const builder = mongoJoinBuilder({ tokenizer });

    const collection = mongoDb.collection('users');
    await collection.insertMany([
      {
        name: 'Jess',
        age: 23,
        address: '123 nowhere',
      },
      {
        name: 'foobar',
        age: 23,
        address: '90210',
      },
      {
        name: 'Alice',
        age: 45,
        address: 'Ramsay Street',
      },
      {
        name: 'foobar',
        age: 23,
        address: 'The Joneses',
      },
      {
        name: 'foobar',
        age: 89,
        address: '456 somewhere',
      },
    ]);

    const joinQuery = {
      name: 'foobar',
      age: 23,
    };

    const result = await builder(joinQuery, getAggregate(mongoDb, 'users'));

    expect(result).toMatchObject([
      {
        name: 'foobar',
        age: 23,
        address: '90210',
      },
      {
        name: 'foobar',
        age: 23,
        address: 'The Joneses',
      },
    ]);
  });

  test('performs AND queries', async () => {
    const tokenizer = {
      simple: jest.fn((query, key) => ({
        pipeline: [
          {
            [key]: { $eq: query[key] },
          },
        ],
      })),
      relationship: jest.fn((query, key) => {
        const [table] = key.split('_');
        return {
          from: `${table}-collection`,
          field: table,
          // called with (parentValue, keyOfRelationship, rootObject, path)
          postQueryMutation: () => {},
          match: { $exists: true, $ne: [] },
          many: true,
        };
      }),
    };

    const builder = mongoJoinBuilder({ tokenizer });

    const collection = mongoDb.collection('users');
    await collection.insertMany([
      {
        name: 'Jess',
        age: 23,
        address: '123 nowhere',
      },
      {
        name: 'foobar',
        age: 23,
        address: '90210',
      },
      {
        name: 'Alice',
        age: 45,
        address: 'Ramsay Street',
      },
      {
        name: 'foobar',
        age: 23,
        address: 'The Joneses',
      },
      {
        name: 'foobar',
        age: 89,
        address: '456 somewhere',
      },
    ]);

    const joinQuery = {
      AND: [{ name: 'foobar' }, { age: 23 }],
    };

    const result = await builder(joinQuery, getAggregate(mongoDb, 'users'));

    expect(result).toMatchObject([
      {
        name: 'foobar',
        age: 23,
        address: '90210',
      },
      {
        name: 'foobar',
        age: 23,
        address: 'The Joneses',
      },
    ]);
  });

  test('performs to-one relationship queries', async () => {
    const tokenizer = {
      simple: jest.fn((query, key) => ({
        pipeline: [
          {
            [key]: { $eq: query[key] },
          },
        ],
      })),
      relationship: jest.fn((query, key, path, uid) => {
        const tableMap = {
          author: 'users',
        };

        return {
          from: tableMap[key],
          field: key,
          // called with (parentValue, keyOfRelationship, rootObject, path)
          postQueryMutation: (parentData, keyOfRelationship) => ({
            ...parentData,
            // Merge the found item back into the original key
            [key]: parentData[keyOfRelationship][0],
          }),
          match: [{ [`${uid}_${key}_every`]: true }],
          many: false,
        };
      }),
    };

    const builder = mongoJoinBuilder({ tokenizer });

    const usersCollection = mongoDb.collection('users');
    const postsCollection = mongoDb.collection('posts');

    const { insertedIds } = await usersCollection.insertMany([
      {
        name: 'Jess',
        type: 'author',
      },
      {
        name: 'Sam',
        type: 'editor',
      },
    ]);

    await postsCollection.insertMany([
      {
        title: 'Hello world',
        status: 'published',
        author: insertedIds[0],
      },
      {
        title: 'Testing',
        status: 'published',
        author: insertedIds[1],
      },
      {
        title: 'An awesome post',
        status: 'draft',
        author: insertedIds[0],
      },
      {
        title: 'Another Thing',
        status: 'published',
        author: insertedIds[1],
      },
    ]);

    const joinQuery = {
      status: 'published',
      author: {
        name: 'Jess',
      },
    };

    const result = await builder(joinQuery, getAggregate(mongoDb, 'posts'));

    expect(result).toMatchObject([
      {
        title: 'Hello world',
        status: 'published',
        author: {
          name: 'Jess',
          type: 'author',
        },
      },
    ]);
  });

  test('performs to-many relationship queries with no filter', async () => {
    const tokenizer = {
      simple: jest.fn((query, key) => ({
        pipeline: [
          {
            [key]: { $eq: query[key] },
          },
        ],
      })),
      relationship: jest.fn((query, key, path, uid) => {
        const [table, criteria] = key.split('_');
        return {
          from: table,
          field: table,
          // called with (parentValue, keyOfRelationship, rootObject, path)
          postQueryMutation: (parentData, keyOfRelationship) => ({
            ...parentData,
            // Merge the found items back into the original key
            [table]: parentData[table].map(id => {
              return (
                parentData[keyOfRelationship].find(
                  relatedItem => relatedItem._id.toString() === id.toString()
                ) || id
              );
            }),
          }),
          match: [{ [`${uid}_${table}_${criteria}`]: true }],
          many: true,
        };
      }),
    };

    const builder = mongoJoinBuilder({ tokenizer });

    const usersCollection = mongoDb.collection('users');
    const postsCollection = mongoDb.collection('posts');

    const { insertedIds } = await postsCollection.insertMany([
      {
        title: 'Hello world',
        status: 'published',
      },
      {
        title: 'Testing',
        status: 'published',
      },
      {
        title: 'An awesome post',
        status: 'draft',
      },
      {
        title: 'Another Thing',
        status: 'published',
      },
    ]);

    await usersCollection.insertMany([
      {
        name: 'Jess',
        type: 'author',
        posts: [insertedIds[0], insertedIds[2]],
      },
      {
        name: 'Alice',
        type: 'author',
        posts: [insertedIds[1], insertedIds[3]],
      },
      {
        name: 'Sam',
        type: 'editor',
        posts: [insertedIds[3]],
      },
    ]);

    const joinQuery = {
      type: 'author',
      posts_every: {},
    };

    const result = await builder(joinQuery, getAggregate(mongoDb, 'users'));

    expect(result).toMatchObject([
      {
        name: 'Jess',
        type: 'author',
        posts: [
          {
            title: 'Hello world',
            status: 'published',
          },
          {
            title: 'An awesome post',
            status: 'draft',
          },
        ],
      },
      {
        name: 'Alice',
        type: 'author',
        posts: [
          {
            title: 'Testing',
            status: 'published',
          },
          {
            title: 'Another Thing',
            status: 'published',
          },
        ],
      },
    ]);
  });

  test('performs to-many relationship queries with postJoinPipeline', async () => {
    const tokenizer = {
      simple: jest.fn((query, key) => {
        const value = query[key];
        if (key === '$limit') {
          return {
            postJoinPipeline: [{ $limit: value }],
          };
        } else if (key === '$sort') {
          const [sortBy, sortDirection] = value.split('_');
          return {
            postJoinPipeline: [{ $sort: { [sortBy]: sortDirection === 'ASC' ? 1 : -1 } }],
          };
        }
        return {
          pipeline: [
            {
              [key]: { $eq: value },
            },
          ],
        };
      }),
      relationship: jest.fn((query, key, path, uid) => {
        const [table, criteria] = key.split('_');
        return {
          from: table,
          field: table,
          // called with (parentValue, keyOfRelationship, rootObject, path)
          postQueryMutation: (parentData, keyOfRelationship) => ({
            ...parentData,
            // Merge the found items back into the original key
            [table]: parentData[keyOfRelationship],
          }),
          match: [{ [`${uid}_${table}_${criteria}`]: true }],
          many: true,
        };
      }),
    };

    const builder = mongoJoinBuilder({ tokenizer });

    const usersCollection = mongoDb.collection('users');
    const postsCollection = mongoDb.collection('posts');

    const { insertedIds } = await postsCollection.insertMany([
      {
        title: 'Hello world',
        status: 'published',
      },
      {
        title: 'Testing',
        status: 'published',
      },
      {
        title: 'An awesome post',
        status: 'draft',
      },
      {
        title: 'Another Thing',
        status: 'published',
      },
    ]);

    await usersCollection.insertMany([
      {
        name: 'Jess',
        type: 'author',
        posts: [insertedIds[0], insertedIds[2]],
      },
      {
        name: 'Alice',
        type: 'author',
        posts: [insertedIds[1], insertedIds[3]],
      },
      {
        name: 'Sam',
        type: 'author',
        posts: [insertedIds[3]],
      },
      {
        name: 'Alex',
        type: 'editor',
        posts: [insertedIds[3]],
      },
    ]);

    const joinQuery = {
      type: 'author',
      posts_every: {
        status: 'published',
        $sort: 'title_ASC',
      },
      $limit: 1,
    };

    const result = await builder(joinQuery, getAggregate(mongoDb, 'users'));

    expect(result).toMatchObject([
      {
        name: 'Alice',
        type: 'author',
        posts: [
          {
            title: 'Another Thing',
            status: 'published',
          },
          {
            title: 'Testing',
            status: 'published',
          },
        ],
      },
    ]);
  });

  test('performs to-many relationship queries', async () => {
    const tokenizer = {
      simple: jest.fn((query, key) => ({
        pipeline: [
          {
            [key]: { $eq: query[key] },
          },
        ],
      })),
      relationship: jest.fn((query, key, path, uid) => {
        const [table, criteria] = key.split('_');
        return {
          from: table,
          field: table,
          // called with (parentValue, keyOfRelationship, rootObject, path)
          postQueryMutation: (parentData, keyOfRelationship) => ({
            ...parentData,
            // Merge the found items back into the original key
            [table]: parentData[table].map(id => {
              return (
                parentData[keyOfRelationship].find(
                  relatedItem => relatedItem._id.toString() === id.toString()
                ) || id
              );
            }),
          }),
          match: [{ [`${uid}_${table}_${criteria}`]: true }],
          many: true,
        };
      }),
    };

    const builder = mongoJoinBuilder({ tokenizer });

    const usersCollection = mongoDb.collection('users');
    const postsCollection = mongoDb.collection('posts');

    const { insertedIds } = await postsCollection.insertMany([
      {
        title: 'Hello world',
        status: 'published',
      },
      {
        title: 'Testing',
        status: 'published',
      },
      {
        title: 'An awesome post',
        status: 'draft',
      },
      {
        title: 'Another Thing',
        status: 'published',
      },
    ]);

    await usersCollection.insertMany([
      {
        name: 'Jess',
        type: 'author',
        posts: [insertedIds[0], insertedIds[2]],
      },
      {
        name: 'Alice',
        type: 'author',
        posts: [insertedIds[1], insertedIds[3]],
      },
      {
        name: 'Sam',
        type: 'editor',
        posts: [insertedIds[3]],
      },
    ]);

    const joinQuery = {
      type: 'author',
      posts_every: {
        status: 'published',
      },
    };

    const result = await builder(joinQuery, getAggregate(mongoDb, 'users'));

    expect(result).toMatchObject([
      {
        name: 'Alice',
        type: 'author',
        posts: [
          {
            title: 'Testing',
            status: 'published',
          },
          {
            title: 'Another Thing',
            status: 'published',
          },
        ],
      },
    ]);
  });

  test('performs to-many relationship queries with nested AND', async () => {
    const tokenizer = {
      simple: jest.fn((query, key) => ({
        pipeline: [
          {
            [key]: { $eq: query[key] },
          },
        ],
      })),
      relationship: jest.fn((query, key, path, uid) => {
        const [table, criteria] = key.split('_');
        return {
          from: table,
          field: table,
          // called with (parentValue, keyOfRelationship, rootObject, path)
          postQueryMutation: (parentData, keyOfRelationship) => ({
            ...parentData,
            // Merge the found items back into the original key
            [table]: parentData[table].map(id => {
              return (
                parentData[keyOfRelationship].find(
                  relatedItem => relatedItem._id.toString() === id.toString()
                ) || id
              );
            }),
          }),
          match: [{ [`${uid}_${table}_${criteria}`]: true }],
          many: true,
        };
      }),
    };

    const builder = mongoJoinBuilder({ tokenizer });

    const usersCollection = mongoDb.collection('users');
    const postsCollection = mongoDb.collection('posts');

    const { insertedIds } = await postsCollection.insertMany([
      {
        title: 'Hello world',
        status: 'published',
        approved: true,
      },
      {
        title: 'Testing',
        status: 'published',
        approved: true,
      },
      {
        title: 'An awesome post',
        status: 'draft',
        approved: true,
      },
      {
        title: 'Another Thing',
        status: 'published',
        approved: true,
      },
    ]);

    await usersCollection.insertMany([
      {
        name: 'Jess',
        type: 'author',
        posts: [insertedIds[0], insertedIds[2]],
      },
      {
        name: 'Alice',
        type: 'author',
        posts: [insertedIds[1], insertedIds[3]],
      },
      {
        name: 'Sam',
        type: 'editor',
        posts: [insertedIds[3]],
      },
    ]);

    const joinQuery = {
      type: 'author',
      posts_every: {
        AND: [{ approved: true }, { status: 'published' }],
      },
    };

    const result = await builder(joinQuery, getAggregate(mongoDb, 'users'));

    expect(result).toMatchObject([
      {
        name: 'Alice',
        type: 'author',
        posts: [
          {
            title: 'Testing',
            status: 'published',
            approved: true,
          },
          {
            title: 'Another Thing',
            status: 'published',
            approved: true,
          },
        ],
      },
    ]);
  });

  test('performs AND query with nested to-many relationship', async () => {
    const tokenizer = {
      simple: jest.fn((query, key) => ({
        pipeline: [
          {
            [key]: { $eq: query[key] },
          },
        ],
      })),
      relationship: jest.fn((query, key, path, uid) => {
        const [table, criteria] = key.split('_');
        return {
          from: table,
          field: table,
          // called with (parentValue, keyOfRelationship, rootObject, path)
          postQueryMutation: (parentData, keyOfRelationship) => ({
            ...parentData,
            // Merge the found items back into the original key
            [table]: parentData[table].map(id => {
              return (
                parentData[keyOfRelationship].find(
                  relatedItem => relatedItem._id.toString() === id.toString()
                ) || id
              );
            }),
          }),
          match: [{ [`${uid}_${table}_${criteria}`]: true }],
          many: true,
        };
      }),
    };

    const builder = mongoJoinBuilder({ tokenizer });

    const usersCollection = mongoDb.collection('users');
    const postsCollection = mongoDb.collection('posts');

    const { insertedIds } = await postsCollection.insertMany([
      {
        title: 'Hello world',
        status: 'published',
      },
      {
        title: 'Testing',
        status: 'published',
      },
      {
        title: 'An awesome post',
        status: 'draft',
      },
      {
        title: 'Another Thing',
        status: 'published',
      },
    ]);

    await usersCollection.insertMany([
      {
        name: 'Jess',
        type: 'author',
        posts: [insertedIds[0], insertedIds[2]],
      },
      {
        name: 'Alice',
        type: 'author',
        posts: [insertedIds[1], insertedIds[3]],
      },
      {
        name: 'Sam',
        type: 'editor',
        posts: [insertedIds[3]],
      },
    ]);

    const joinQuery = {
      AND: [
        { type: 'author' },
        {
          posts_every: {
            status: 'published',
          },
        },
      ],
    };

    const result = await builder(joinQuery, getAggregate(mongoDb, 'users'));

    expect(result).toMatchObject([
      {
        name: 'Alice',
        type: 'author',
        posts: [
          {
            title: 'Testing',
            status: 'published',
          },
          {
            title: 'Another Thing',
            status: 'published',
          },
        ],
      },
    ]);
  });
});
