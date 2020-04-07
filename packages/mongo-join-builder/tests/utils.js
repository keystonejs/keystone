const findFieldAdapterForQuerySegment = ({ fieldAdapters }) => segment =>
  fieldAdapters.find(({ path }) => path === segment || path === segment.split('_')[0]);

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
      field: { many: true },
      rel: {
        cardinality: 'N:N',
        columnNames: {
          'Tag.posts': { near: 'Tag_id', far: 'Post_id' },
          'Post.tags': { near: 'Post_id', far: 'Tag_id' },
        },
        collectionName: 'posts_tags',
      },
      getQueryConditions: () => {},
      getRefListAdapter: () => tagsAdapter,
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
      field: { many: false },
      rel: { columnNames: { User: {}, Company: {} } },
      getQueryConditions: () => {},
      getRefListAdapter: () => ({
        model: { collection: { name: 'company-collection' } },
        fieldAdapters: [
          {
            dbPath: 'name',
            getQueryConditions: dbPath => ({ [dbPath]: val => ({ [dbPath]: { $eq: val } }) }),
          },
        ],
      }),
    },
  ],
};

listAdapter.fieldAdapters.push({
  getQueryConditions: () => {},
  path: 'posts',
  field: { many: true },
  rel: {
    cardinality: '1:N',
    columnNames: { Tag: {}, Post: {} },
    columnName: 'author',
    tableName: 'Post',
  },
  getRefListAdapter: () => postsAdapter,
});

tagsAdapter.fieldAdapters.push({
  path: 'posts',
  field: { many: true },
  rel: {
    cardinality: 'N:N',
    columnNames: {
      'Tag.posts': { near: 'Tag_id', far: 'Post_id' },
      'Post.tags': { near: 'Post_id', far: 'Tag_id' },
    },
    collectionName: 'posts_tags',
  },
  getQueryConditions: () => {},
  getRefListAdapter: () => postsAdapter,
});

postsAdapter.fieldAdapters.push({
  getQueryConditions: () => {},
  path: 'author',
  field: { many: false },
  rel: {
    cardinality: '1:N',
    columnNames: { Tag: {}, Post: {} },
    columnName: 'author',
    tableName: 'Post',
  },
  getRefListAdapter: () => listAdapter,
});

postsAdapter.findFieldAdapterForQuerySegment = findFieldAdapterForQuerySegment(postsAdapter);
tagsAdapter.findFieldAdapterForQuerySegment = findFieldAdapterForQuerySegment(tagsAdapter);
listAdapter.findFieldAdapterForQuerySegment = findFieldAdapterForQuerySegment(listAdapter);

module.exports = { tagsAdapter, postsAdapter, listAdapter };
