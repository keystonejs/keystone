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
        field: { many: true },
        path: 'posts',
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
          let: expect.any(Object),
          pipeline: [
            { $match: { $expr: { $in: ['$_id', expect.any(String)] } } },
            { $match: { name: { $eq: 'foo' } } },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      { $addFields: expect.any(Object) },
      { $match: { $and: [expect.any(Object), { title: { $eq: 'bar' } }] } },
      { $addFields: { id: '$_id' } },
    ]);

    await userListAdapter.itemsQuery({
      where: { OR: [{ posts_some: { name: 'foo' } }, { title: 'bar' }] },
    });

    expect(userListAdapter.model.aggregate).toHaveBeenCalledWith([
      {
        $lookup: {
          as: expect.any(String),
          from: 'posts',
          let: expect.any(Object),
          pipeline: [
            { $match: { $expr: { $in: ['$_id', expect.any(String)] } } },
            { $match: { name: { $eq: 'foo' } } },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      { $addFields: expect.any(Object) },
      { $match: { $or: [expect.any(Object), { title: { $eq: 'bar' } }] } },
      { $addFields: { id: '$_id' } },
    ]);
  });

  test('Correctly applies conditions of AND/OR fields nested in relationships', async () => {
    const { MongooseListAdapter } = require('../');

    const postListAdapter = createListAdapter(MongooseListAdapter, 'post');
    postListAdapter.fieldAdapters = [
      {
        isRelationship: false,
        getQueryConditions: () => ({ name: value => ({ name: { $eq: value } }) }),
      },
      {
        isRelationship: false,
        getQueryConditions: () => ({ title: value => ({ title: { $eq: value } }) }),
      },
      {
        isRelationship: true,
        getQueryConditions: () => ({}),
        supportsRelationshipQuery: query => query === 'posts_some',
        getRefListAdapter: () => ({ model: { collection: { name: 'posts' } } }),
        field: { many: true },
        path: 'posts',
      },
    ];

    const userListAdapter = createListAdapter(MongooseListAdapter, 'user');
    userListAdapter.fieldAdapters = [
      {
        isRelationship: true,
        getQueryConditions: () => {},
        supportsRelationshipQuery: query => query === 'posts_some',
        getRefListAdapter: () => postListAdapter,
        field: { many: true },
        path: 'posts',
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
          let: expect.any(Object),
          pipeline: [
            { $match: { $expr: { $in: ['$_id', expect.any(String)] } } },
            { $match: { $and: [{ name: { $eq: 'foo' } }, { title: { $eq: 'bar' } }] } },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      { $addFields: expect.any(Object) },
      { $match: expect.any(Object) },
      { $addFields: { id: '$_id' } },
    ]);

    await userListAdapter.itemsQuery({
      where: { posts_some: { OR: [{ name: 'foo' }, { title: 'bar' }] } },
    });

    expect(userListAdapter.model.aggregate).toHaveBeenCalledWith([
      {
        $lookup: {
          as: expect.any(String),
          from: 'posts',
          let: expect.any(Object),
          pipeline: [
            { $match: { $expr: { $in: ['$_id', expect.any(String)] } } },
            { $match: { $or: [{ name: { $eq: 'foo' } }, { title: { $eq: 'bar' } }] } },
            { $addFields: { id: '$_id' } },
          ],
        },
      },
      { $addFields: expect.any(Object) },
      { $match: expect.any(Object) },
      { $addFields: { id: '$_id' } },
    ]);
  });
});
