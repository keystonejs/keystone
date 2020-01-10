const { queryParser, pipelineBuilder, mutationBuilder } = require('../');
const { postsAdapter, listAdapter } = require('./utils');

const { MongoClient } = require('mongodb');
const MongoDBMemoryServer = require('mongodb-memory-server').default;

const mongoJoinBuilder = parserOptions => {
  return async (query, aggregate) => {
    const queryTree = queryParser(parserOptions, query);
    const pipeline = pipelineBuilder(queryTree);
    const postQueryMutations = mutationBuilder(queryTree.relationships);
    // Run the query against the given database and collection
    return await aggregate(pipeline).then(postQueryMutations);
  };
};

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

let mongoConnection;
let mongoDb;
let mongoServer;

// `mongodb-memory-server` downloads a binary on first run in CI, which can take
// a while, so we bump up the timeout here.
jest.setTimeout(60000);

beforeAll(async () => {
  mongoServer = new MongoDBMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  mongoConnection = await MongoClient.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoDb = mongoConnection.db(await mongoServer.getDbName());
});

afterAll(() => {
  mongoConnection.close();
  mongoServer.stop();
});

beforeEach(async () => {
  const collections = await mongoDb.collections();
  await Promise.all(collections.map(collection => collection.deleteMany({})));
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
    const builder = mongoJoinBuilder({ listAdapter });

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

    const query = {
      name: 'foobar',
      age: 23,
    };

    const result = await builder(query, getAggregate(mongoDb, 'users'));

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
    const builder = mongoJoinBuilder({ listAdapter });

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

    const query = {
      AND: [{ name: 'foobar' }, { age: 23 }],
    };

    const result = await builder(query, getAggregate(mongoDb, 'users'));

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
    const builder = mongoJoinBuilder({ listAdapter: postsAdapter });

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

    const query = {
      status: 'published',
      author: {
        name: 'Jess',
      },
    };

    const result = await builder(query, getAggregate(mongoDb, 'posts'));

    expect(result).toMatchObject([
      {
        title: 'Hello world',
        status: 'published',
        author: insertedIds[0],
      },
    ]);
  });

  test('performs to-many relationship queries with no filter', async () => {
    const builder = mongoJoinBuilder({ listAdapter });

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

    const query = {
      type: 'author',
    };

    const result = await builder(query, getAggregate(mongoDb, 'users'));

    expect(result).toMatchObject([
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
    ]);
  });

  test('performs to-many relationship queries with postJoinPipeline', async () => {
    const builder = mongoJoinBuilder({ listAdapter });

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

    const query = {
      type: 'author',
      posts_every: {
        status: 'published',
        $sort: 'title_ASC',
      },
      $first: 1,
    };

    const result = await builder(query, getAggregate(mongoDb, 'users'));
    expect(result).toMatchObject([
      {
        name: 'Alice',
        type: 'author',
        posts: [insertedIds[1], insertedIds[3]],
      },
    ]);
  });

  test('performs to-many relationship queries', async () => {
    const builder = mongoJoinBuilder({ listAdapter });

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

    const query = {
      type: 'author',
      posts_every: {
        status: 'published',
      },
    };

    const result = await builder(query, getAggregate(mongoDb, 'users'));

    expect(result).toMatchObject([
      {
        name: 'Alice',
        type: 'author',
        posts: [insertedIds[1], insertedIds[3]],
      },
    ]);
  });

  test('performs to-many relationship queries with nested AND', async () => {
    const builder = mongoJoinBuilder({ listAdapter });

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

    const query = {
      type: 'author',
      posts_every: {
        AND: [{ approved: true }, { status: 'published' }],
      },
    };

    const result = await builder(query, getAggregate(mongoDb, 'users'));

    expect(result).toMatchObject([
      {
        name: 'Alice',
        type: 'author',
        posts: [insertedIds[1], insertedIds[3]],
      },
    ]);
  });

  test('performs AND query with nested to-many relationship', async () => {
    const builder = mongoJoinBuilder({ listAdapter });

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

    const query = {
      AND: [
        { type: 'author' },
        {
          posts_every: {
            status: 'published',
          },
        },
      ],
    };

    const result = await builder(query, getAggregate(mongoDb, 'users'));

    expect(result).toMatchObject([
      {
        name: 'Alice',
        type: 'author',
        posts: [insertedIds[1], insertedIds[3]],
      },
    ]);
  });
});
