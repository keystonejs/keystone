const pluralize = require('pluralize');
function createListAdapter(MongooseListAdapter, key, { aggregateResult = [] } = {}) {
  const listAdapter = new MongooseListAdapter(
    key,
    {
      mongoose: { Schema: function schema() {} },
      getListAdapterByKey: () => {},
    },
    {}
  );

  listAdapter.model = {
    aggregate: jest.fn(() => ({ exec: () => Promise.resolve(aggregateResult) })),
    collection: { name: pluralize.plural(key) },
  };

  return listAdapter;
}

beforeEach(() => {
  jest.resetModules();
});

describe('MongooseListAdapter', () => {
  test('Correctly applies simple conditions', async () => {
    const { MongooseListAdapter } = require('../');

    const listAdapter = createListAdapter(MongooseListAdapter, 'user');
    listAdapter.fieldAdapters = [
      { getQueryConditions: () => ({ title: value => ({ title: { $eq: value } }) }) },
    ];

    await listAdapter.itemsQuery({ where: { title: 'foo' } });

    expect(listAdapter.model.aggregate).toHaveBeenCalledWith([
      { $match: { title: { $eq: 'foo' } } },
      { $addFields: { id: '$_id' } },
    ]);
  });

  test('Correctly applies conditions of relationships in nested AND/OR fields', async () => {
    const { MongooseListAdapter } = require('../');
    const postListAdapter = createListAdapter(MongooseListAdapter, 'post');
    postListAdapter.fieldAdapters = [
      { getQueryConditions: () => ({ name: value => ({ name: { $eq: value } }) }) },
    ];

    const userListAdapter = createListAdapter(MongooseListAdapter, 'user');
    userListAdapter.fieldAdapters = [
      {
        isRelationship: false,
        getQueryConditions: () => ({ title: value => ({ title: { $eq: value } }) }),
      },
      {
        isRelationship: true,
        getQueryConditions: () => {},
        supportsRelationshipQuery: query => query === 'posts_some',
        getRefListAdapter: () => postListAdapter,
        field: { config: { many: true }, many: true },
        path: 'posts',
        dbPath: 'posts',
        rel: { cardinality: '1:N', tableName: 'Post', columnName: 'author' },
      },
    ];

    await userListAdapter.itemsQuery({
      where: { AND: [{ posts_some: { name: 'foo' } }, { title: 'bar' }] },
    });
    expect(userListAdapter.model.aggregate).toHaveBeenCalledWith([
      {
        $lookup: {
          as: expect.any(String),
          from: 'posts',
          let: { tmpVar: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$author', '$$tmpVar'] } } },
            { $match: { name: { $eq: 'foo' } } },
            { $addFields: { id: '$_id' } },
            { $project: { posts: 0 } },
          ],
        },
      },
      { $match: { $and: [expect.any(Object), { title: { $eq: 'bar' } }] } },
      { $addFields: { id: '$_id' } },
      { $project: expect.any(Object) },
    ]);

    await userListAdapter.itemsQuery({
      where: { OR: [{ posts_some: { name: 'foo' } }, { title: 'bar' }] },
    });

    expect(userListAdapter.model.aggregate).toHaveBeenCalledWith([
      {
        $lookup: {
          as: expect.any(String),
          from: 'posts',
          let: { tmpVar: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$author', '$$tmpVar'] } } },
            { $match: { name: { $eq: 'foo' } } },
            { $addFields: { id: '$_id' } },
            { $project: { posts: 0 } },
          ],
        },
      },
      { $match: { $or: [expect.any(Object), { title: { $eq: 'bar' } }] } },
      { $addFields: { id: '$_id' } },
      { $project: expect.any(Object) },
    ]);
  });

  test('Correctly applies conditions of AND/OR fields nested in relationships', async () => {
    const { MongooseListAdapter } = require('../');

    const postListAdapter = createListAdapter(MongooseListAdapter, 'post');
    postListAdapter.fieldAdapters = [
      {
        isRelationship: false,
        getQueryConditions: () => ({ name: value => ({ name: { $eq: value } }) }),
        field: { config: { many: false }, many: false },
      },
      {
        isRelationship: false,
        getQueryConditions: () => ({ title: value => ({ title: { $eq: value } }) }),
        field: { config: { many: false }, many: false },
      },
    ];

    const userListAdapter = createListAdapter(MongooseListAdapter, 'user');
    userListAdapter.fieldAdapters = [
      {
        isRelationship: true,
        getQueryConditions: () => {},
        supportsRelationshipQuery: query => query === 'posts_some',
        getRefListAdapter: () => postListAdapter,
        field: { config: { many: true }, many: true },
        path: 'posts',
        dbPath: 'posts',
        rel: { cardinality: '1:N', tableName: 'Post', columnName: 'author' },
      },
    ];

    await userListAdapter.itemsQuery({
      where: { posts_some: { AND: [{ name: 'foo' }, { title: 'bar' }] } },
    });

    expect(userListAdapter.model.aggregate).toHaveBeenCalledWith([
      {
        $lookup: {
          as: expect.any(String),
          from: 'posts',
          let: { tmpVar: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$author', '$$tmpVar'] } } },
            { $match: { $and: [{ name: { $eq: 'foo' } }, { title: { $eq: 'bar' } }] } },
            { $addFields: { id: '$_id' } },
            { $project: { posts: 0 } },
          ],
        },
      },
      { $match: expect.any(Object) },
      { $addFields: { id: '$_id' } },
      { $project: expect.any(Object) },
    ]);

    await userListAdapter.itemsQuery({
      where: { posts_some: { OR: [{ name: 'foo' }, { title: 'bar' }] } },
    });

    expect(userListAdapter.model.aggregate).toHaveBeenCalledWith([
      {
        $lookup: {
          as: expect.any(String),
          from: 'posts',
          let: { tmpVar: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$author', '$$tmpVar'] } } },
            { $match: { $or: [{ name: { $eq: 'foo' } }, { title: { $eq: 'bar' } }] } },
            { $addFields: { id: '$_id' } },
            { $project: { posts: 0 } },
          ],
        },
      },
      { $match: expect.any(Object) },
      { $addFields: { id: '$_id' } },
      { $project: expect.any(Object) },
    ]);
  });
});
