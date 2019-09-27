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
  };

  return listAdapter;
}

beforeEach(() => {
  jest.resetModules();
});

describe('MongooseListAdapter', () => {
  test('Correctly applies simple conditions', async () => {
    let listAdapter;

    // Mock things before we require other things
    jest.doMock('../lib/tokenizers/relationship-path', () => {
      return {
        getRelatedListAdapterFromQueryPathFactory: jest.fn(() => {
          return jest.fn(() => listAdapter);
        }),
      };
    });

    const { MongooseListAdapter } = require('../');

    listAdapter = createListAdapter(MongooseListAdapter, 'user');
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
    let userListAdapter;
    let postListAdapter;

    // Mock things before we require other things
    jest.doMock('../lib/tokenizers/relationship-path', () => ({
      getRelatedListAdapterFromQueryPathFactory: jest.fn(() =>
        jest.fn(query => {
          if (query[query.length - 1] === 'posts_some') {
            return postListAdapter;
          } else {
            return userListAdapter;
          }
        })
      ),
    }));

    const { MongooseListAdapter } = require('../');

    userListAdapter = createListAdapter(MongooseListAdapter, 'user');
    userListAdapter.fieldAdapters = [
      {
        isRelationship: false,
        getQueryConditions: () => ({ title: value => ({ title: { $eq: value } }) }),
      },
      {
        isRelationship: true,
        getQueryConditions: () => {},
        supportsRelationshipQuery: query => query === 'posts_some',
        getRelationshipQueryCondition: () => ({
          from: 'posts',
          field: 'posts',
          matchTerm: { posts_some: true },
          // Flag this is a to-many relationship
          many: true,
        }),
      },
    ];

    postListAdapter = createListAdapter(MongooseListAdapter, 'post');
    postListAdapter.fieldAdapters = [
      { getQueryConditions: () => ({ name: value => ({ name: { $eq: value } }) }) },
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
      { $match: { $and: [{ posts_some: true }, { title: { $eq: 'bar' } }] } },
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
      { $match: { $or: [{ posts_some: true }, { title: { $eq: 'bar' } }] } },
      { $addFields: { id: '$_id' } },
    ]);
  });

  test('Correctly applies conditions of AND/OR fields nested in relationships', async () => {
    let userListAdapter;
    let postListAdapter;

    // Mock things before we require other things
    jest.doMock('../lib/tokenizers/relationship-path', () => ({
      getRelatedListAdapterFromQueryPathFactory: jest.fn(() => jest.fn(() => postListAdapter)),
    }));

    const { MongooseListAdapter } = require('../');

    userListAdapter = createListAdapter(MongooseListAdapter, 'user');

    postListAdapter = createListAdapter(MongooseListAdapter, 'post');
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
        getRelationshipQueryCondition: () => ({
          from: 'posts',
          field: 'posts',
          matchTerm: { posts_some: true },
          // Flag this is a to-many relationship
          many: true,
        }),
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
      { $match: { posts_some: true } },
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
      { $match: { posts_some: true } },
      { $addFields: { id: '$_id' } },
    ]);
  });
});
