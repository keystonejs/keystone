const tagsAdapter = {
  key: 'Tag',
  model: { collection: { name: 'tags' } },
  _getModel: () => ({ collection: { name: 'posts_tags' } }),
  fieldAdapters: [
    {
      dbPath: 'name',
      getQueryConditions: dbPath => ({ [dbPath]: val => ({ [dbPath]: { $eq: val } }) }),
    },
  ],
  graphQlQueryPathToMongoField: orderField => orderField,
};

const postsAdapter = {
  key: 'Post',
  model: { collection: { name: 'posts' } },
  _getModel: () => ({ collection: { name: 'posts_tags' } }),
  fieldAdapters: [
    {
      dbPath: 'title',
      getQueryConditions: dbPath => ({ [dbPath]: val => ({ [dbPath]: { $eq: val } }) }),
    },
    {
      dbPath: 'status',
      getQueryConditions: dbPath => ({ [dbPath]: val => ({ [dbPath]: { $eq: val } }) }),
    },
    {
      path: 'tags',
      dbPath: 'tags',
      isRelationship: true,
      field: { many: true, config: { many: true } },
      rel: {
        cardinality: 'N:N',
        columnNames: {
          'Tag.posts': { near: 'Tag_id', far: 'Post_id' },
          'Post.tags': { near: 'Post_id', far: 'Tag_id' },
        },
        collectionName: 'posts_tags',
      },
      getQueryConditions: () => {},
      getListByKey: () => ({ adapter: tagsAdapter }),
    },
  ],
  graphQlQueryPathToMongoField: orderField => orderField,
};

const listAdapter = {
  key: 'User',
  model: { collection: { name: 'users' } },
  fieldAdapters: [
    {
      dbPath: 'name',
      getQueryConditions: dbPath => ({ [dbPath]: val => ({ [dbPath]: { $eq: val } }) }),
    },
    {
      dbPath: 'age',
      getQueryConditions: dbPath => ({ [dbPath]: val => ({ [dbPath]: { $eq: val } }) }),
    },
    {
      dbPath: 'address',
      getQueryConditions: dbPath => ({ [dbPath]: val => ({ [dbPath]: { $eq: val } }) }),
    },
    {
      dbPath: 'email',
      getQueryConditions: dbPath => ({ [dbPath]: val => ({ [dbPath]: { $eq: val } }) }),
    },
    {
      dbPath: 'type',
      getQueryConditions: dbPath => ({ [dbPath]: val => ({ [dbPath]: { $eq: val } }) }),
    },
    {
      path: 'company',
      isRelationship: true,
      field: { many: false, config: { many: false } },
      rel: { columnNames: { User: {}, Company: {} } },
      getQueryConditions: () => {},
      getListByKey: () => ({
        adapter: {
          model: { collection: { name: 'company-collection' } },
          fieldAdapters: [
            {
              dbPath: 'name',
              getQueryConditions: dbPath => ({ [dbPath]: val => ({ [dbPath]: { $eq: val } }) }),
            },
          ],
        },
      }),
    },
  ],
};

listAdapter.fieldAdapters.push({
  getQueryConditions: () => {},
  path: 'posts',
  dbPath: 'posts',
  isRelationship: true,
  field: { many: true, config: { many: true } },
  rel: {
    cardinality: '1:N',
    columnNames: { Tag: {}, Post: {} },
    columnName: 'author',
    tableName: 'Post',
  },
  getListByKey: () => ({ adapter: postsAdapter }),
});

tagsAdapter.fieldAdapters.push({
  path: 'posts',
  dbPath: 'posts',
  isRelationship: true,
  field: { many: true, config: { many: true } },
  rel: {
    cardinality: 'N:N',
    columnNames: {
      'Tag.posts': { near: 'Tag_id', far: 'Post_id' },
      'Post.tags': { near: 'Post_id', far: 'Tag_id' },
    },
    collectionName: 'posts_tags',
  },
  getQueryConditions: () => {},
  getListByKey: () => ({ adapter: postsAdapter }),
});

postsAdapter.fieldAdapters.push({
  getQueryConditions: () => {},
  path: 'author',
  isRelationship: true,
  field: { many: false, config: { many: false } },
  rel: {
    cardinality: '1:N',
    columnNames: { Tag: {}, Post: {} },
    columnName: 'author',
    tableName: 'Post',
  },
  getListByKey: () => ({ adapter: listAdapter }),
});

module.exports = { tagsAdapter, postsAdapter, listAdapter };
