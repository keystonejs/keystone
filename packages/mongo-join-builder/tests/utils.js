const findFieldAdapterForQuerySegment = ({ fieldAdapters }) => segment =>
  fieldAdapters.find(({ path }) => path === segment || path === segment.split('_')[0]);

const tagsAdapter = {
  key: 'tags',
  model: { collection: { name: 'tags' } },
  fieldAdapters: [
    {
      dbPath: 'name',
      getQueryConditions: dbPath => ({ [dbPath]: val => ({ [dbPath]: { $eq: val } }) }),
    },
  ],
  graphQlQueryPathToMongoField: orderField => orderField,
};

const postsAdapter = {
  key: 'posts',
  model: { collection: { name: 'posts' } },
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
      getQueryConditions: () => {},
      getRefListAdapter: () => tagsAdapter,
    },
  ],
  graphQlQueryPathToMongoField: orderField => orderField,
};

const listAdapter = {
  key: 'users',
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
  getRefListAdapter: () => postsAdapter,
});

tagsAdapter.fieldAdapters.push({
  path: 'posts',
  field: { many: true },
  getQueryConditions: () => {},
  getRefListAdapter: () => postsAdapter,
});

postsAdapter.fieldAdapters.push({
  getQueryConditions: () => {},
  path: 'author',
  field: { many: false },
  getRefListAdapter: () => listAdapter,
});

postsAdapter.findFieldAdapterForQuerySegment = findFieldAdapterForQuerySegment(postsAdapter);
tagsAdapter.findFieldAdapterForQuerySegment = findFieldAdapterForQuerySegment(tagsAdapter);
listAdapter.findFieldAdapterForQuerySegment = findFieldAdapterForQuerySegment(listAdapter);

module.exports = { tagsAdapter, postsAdapter, listAdapter };
