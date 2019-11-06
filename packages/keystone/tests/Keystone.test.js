const isPromise = require('p-is-promise');
const Keystone = require('../lib/Keystone');
const List = require('../lib/List');
const { Text, Relationship } = require('@keystonejs/fields');

class MockFieldAdapter {}

class MockFieldImplementation {
  constructor(name) {
    this.access = {
      public: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    };
    this.config = {};
    this.name = name;
  }
  getGqlAuxTypes() {
    return ['scalar Foo'];
  }
  gqlOutputFields() {
    return ['foo: Boolean'];
  }
  gqlQueryInputFields() {
    return ['zip: Boolean'];
  }
  get gqlUpdateInputFields() {
    return ['zap: Boolean'];
  }
  get gqlCreateInputFields() {
    return ['quux: Boolean'];
  }
  getGqlAuxQueries() {
    return ['getFoo: Boolean'];
  }
  getGqlAuxMutations() {
    return ['mutateFoo: Boolean'];
  }
  extendAdminViews(views) {
    return views;
  }
}

const MockFieldType = {
  implementation: MockFieldImplementation,
  views: {},
  adapters: { mock: MockFieldAdapter },
};

class MockListAdapter {
  constructor(parentAdapter) {
    this.parentAdapter = parentAdapter;
  }
  key = 'mock';
  newFieldAdapter = () => new MockFieldAdapter();
}

class MockAdapter {
  name = 'mock';
  newListAdapter = () => new MockListAdapter(this);
  getDefaultPrimaryKeyConfig = () => ({ type: MockFieldType });
}

test('Check require', () => {
  expect(Keystone).not.toBeNull();
});

test('new Keystone()', () => {
  const config = {
    name: 'Jest Test',
    adapter: new MockAdapter(),
  };
  const keystone = new Keystone(config);
  expect(keystone.name).toEqual(config.name);
});

test('unique typeDefs', () => {
  const config = {
    adapter: new MockAdapter(),
    name: 'Jest Test for typeDefs',
  };
  const keystone = new Keystone(config);

  keystone.createList('User', {
    fields: {
      images: { type: MockFieldType },
    },
  });

  keystone.createList('Post', {
    fields: {
      hero: { type: MockFieldType },
    },
  });
  const schemaName = 'public';
  const schema = keystone.getTypeDefs({ schemaName }).join('\n');
  expect(schema.match(/scalar Foo/g) || []).toHaveLength(1);
  expect(schema.match(/getFoo: Boolean/g) || []).toHaveLength(1);
  expect(schema.match(/mutateFoo: Boolean/g) || []).toHaveLength(1);
});

describe('Keystone.createList()', () => {
  test('basic', () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);

    expect(keystone.lists).toEqual({});
    expect(keystone.listsArray).toEqual([]);

    keystone.createList('User', {
      fields: {
        name: { type: MockFieldType },
        email: { type: MockFieldType },
      },
    });

    expect(keystone.lists).toHaveProperty('User');
    expect(keystone.lists['User']).toBeInstanceOf(List);
    expect(keystone.listsArray).toHaveLength(1);
    expect(keystone.listsArray[0]).toBeInstanceOf(List);

    expect(keystone.listsArray[0]).toBe(keystone.lists['User']);
  });

  /* eslint-disable jest/no-disabled-tests */
  describe('access control config', () => {
    test.todo('expands shorthand acl config');
    test.todo('throws error when one of create/read/update/delete not set on object');
    test.todo('throws error when create/read/update/delete are not correct type');
  });
  /* eslint-enable jest/no-disabled-tests */

  test('plugins', () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);

    keystone.createList('User', {
      fields: {
        name: { type: MockFieldType },
        email: { type: MockFieldType },
      },
    });
    keystone.createList('Post', {
      fields: {
        title: { type: MockFieldType },
        content: { type: MockFieldType },
      },
      plugins: [
        config => ({ ...config, fields: { ...config.fields, extra: { type: MockFieldType } } }),
      ],
    });
    keystone.createList('Comment', {
      fields: {
        heading: { type: MockFieldType },
        content: { type: MockFieldType },
      },
      plugins: [
        // Add a field and then remove it, to make sure plugins happen in the right order
        config => ({ ...config, fields: { ...config.fields, extra: { type: MockFieldType } } }),
        config => ({
          ...config,
          fields: Object.entries(config.fields)
            .filter(([name]) => name !== 'extra')
            .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
        }),
      ],
    });
    expect(keystone.lists['User'].fields.length).toEqual(3); // id, name, email
    expect(keystone.lists['Post'].fields.length).toEqual(4); // id, title, content, extra
    expect(keystone.lists['Comment'].fields.length).toEqual(3); // id, heading, content
  });
});

describe('Keystone.extendGraphQLSchema()', () => {
  test('types', () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    keystone.createList('User', {
      fields: {
        name: { type: MockFieldType },
        email: { type: MockFieldType },
      },
    });

    keystone.extendGraphQLSchema({ types: [{ type: 'type FooBar { foo: Int, bar: Float }' }] });
    const schemaName = 'public';
    const schema = keystone.getTypeDefs({ schemaName }).join('\n');
    expect(schema.match(/type FooBar {\s*foo: Int\s*bar: Float\s*}/g) || []).toHaveLength(1);
  });

  test('queries', () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    keystone.createList('User', {
      fields: {
        name: { type: MockFieldType },
        email: { type: MockFieldType },
      },
    });

    keystone.extendGraphQLSchema({
      queries: [
        {
          schema: 'double(x: Int): Int',
          resolver: (_, { x }) => 2 * x,
        },
      ],
    });
    const schemaName = 'public';
    const schema = keystone.getTypeDefs({ schemaName }).join('\n');
    expect(schema.match(/double\(x: Int\): Int/g) || []).toHaveLength(1);
    expect(keystone._extendedQueries).toHaveLength(1);
  });

  test('mutations', () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    keystone.createList('User', {
      fields: {
        name: { type: MockFieldType },
        email: { type: MockFieldType },
      },
    });

    keystone.extendGraphQLSchema({
      mutations: [
        {
          schema: 'double(x: Int): Int',
          resolver: (_, { x }) => 2 * x,
        },
      ],
    });
    const schemaName = 'public';
    const schema = keystone.getTypeDefs({ schemaName }).join('\n');
    expect(schema.match(/double\(x: Int\): Int/g) || []).toHaveLength(1);
    expect(keystone._extendedMutations).toHaveLength(1);
  });
});

describe('Keystone.createItems()', () => {
  const lists = {
    User: {
      key: 'User',
      _fields: {
        name: { type: Text },
        posts: { type: Relationship, many: true, ref: 'Post' },
      },
      adapter: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        itemsQuery: jest.fn(),
      },
    },
    Post: {
      key: 'Post',
      _fields: {
        title: { type: Text },
        author: { type: Relationship, ref: 'User' },
      },
      adapter: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        itemsQuery: jest.fn(),
      },
    },
  };

  function setupMocks() {
    const created = {};

    // Create mocks
    let id = 1;
    Object.keys(lists).forEach(listKey => {
      lists[listKey].adapter.create.mockImplementation(input => {
        const newItem = { id: id++, ...input };
        created[listKey] = created[listKey] || [];
        created[listKey].push(newItem);
        return newItem;
      });

      // Update mocks
      lists[listKey].adapter.update.mockImplementation((_, data) => data);
    });

    // Query mocks
    lists.User.adapter.itemsQuery.mockImplementation(({ where: { name } }) =>
      created.User.filter(item => item.name === name)
    );
    lists.Post.adapter.itemsQuery.mockImplementation(({ where: { title } }) =>
      created.Post.filter(item => item.title === title)
    );
  }

  beforeEach(() => {
    // Reset call counts, etc, back to normal
    lists.User.adapter.itemsQuery.mockReset();
    lists.User.adapter.create.mockReset();
    lists.User.adapter.update.mockReset();
    lists.User.adapter.delete.mockReset();
    lists.Post.adapter.itemsQuery.mockReset();
    lists.Post.adapter.create.mockReset();
    lists.Post.adapter.update.mockReset();
    lists.Post.adapter.delete.mockReset();
  });

  test('creates items', async () => {
    const keystone = new Keystone({
      adapter: new MockAdapter(),
      name: 'Jest Test',
    });

    // mock the lists
    keystone.lists = lists;

    setupMocks();

    await keystone.createItems({
      User: [{ name: 'Jess' }, { name: 'Lauren' }],
      Post: [{ title: 'Hello world' }, { title: 'Goodbye' }],
    });

    expect(keystone.lists.User.adapter.create).toHaveBeenCalledWith({
      name: 'Jess',
    });
    expect(keystone.lists.User.adapter.create).toHaveBeenCalledWith({
      name: 'Lauren',
    });
    expect(keystone.lists.Post.adapter.create).toHaveBeenCalledWith({
      title: 'Hello world',
    });
    expect(keystone.lists.Post.adapter.create).toHaveBeenCalledWith({
      title: 'Goodbye',
    });
  });

  test('returns the created items', async () => {
    const keystone = new Keystone({
      adapter: new MockAdapter(),
      name: 'Jest Test',
    });

    // mock the lists
    keystone.lists = lists;

    setupMocks();

    const createdItems = await keystone.createItems({
      User: [{ name: 'Jess' }, { name: 'Lauren' }],
      Post: [{ title: 'Hello world' }, { title: 'Goodbye' }],
    });

    expect(createdItems).toEqual({
      User: [{ id: 1, name: 'Jess' }, { id: 2, name: 'Lauren' }],
      Post: [{ id: 3, title: 'Hello world' }, { id: 4, title: 'Goodbye' }],
    });
  });

  test('creates items and adds in relationships', async () => {
    const keystone = new Keystone({
      adapter: new MockAdapter(),
      name: 'Jest Test',
    });

    // mock the lists
    keystone.lists = lists;

    setupMocks();

    const createdItems = await keystone.createItems({
      User: [{ name: 'Jess' }, { name: 'Lauren' }],
      Post: [
        { title: 'Hello world', author: { where: { name: 'Lauren' } } },
        { title: 'Goodbye', author: { where: { name: 'Jess' } } },
      ],
    });

    expect(createdItems).toEqual({
      User: [{ id: 1, name: 'Jess' }, { id: 2, name: 'Lauren' }],
      Post: [{ id: 3, title: 'Hello world', author: 2 }, { id: 4, title: 'Goodbye', author: 1 }],
    });
  });

  test('deletes created items when relationships fail', async () => {
    const keystone = new Keystone({
      adapter: new MockAdapter(),
      name: 'Jest Test',
    });

    // mock the lists
    keystone.lists = lists;

    setupMocks();

    try {
      await keystone.createItems({
        User: [{ name: 'Jess' }, { name: 'Lauren' }],
        Post: [
          { title: 'Hello world', author: { where: { name: 'Not Real' } } },
          { title: 'Goodbye', author: { where: { name: 'No Go' } } },
        ],
      });
    } catch (error) {
      // ignore
    } finally {
      expect(keystone.lists.User.adapter.delete).toHaveBeenCalledWith(1);
      expect(keystone.lists.User.adapter.delete).toHaveBeenCalledWith(2);
      expect(keystone.lists.Post.adapter.delete).toHaveBeenCalledWith(3);
      expect(keystone.lists.Post.adapter.delete).toHaveBeenCalledWith(4);
    }
  });
});

describe('keystone.prepare()', () => {
  test('returns a Promise', () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);

    // NOTE: We add a `.catch()` to silence the "unhandled promise rejection"
    // warning
    expect(isPromise(keystone.prepare().catch(() => {}))).toBeTruthy();
  });

  test('returns the middlewares array', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare();

    expect(middlewares).toBeInstanceOf(Array);
  });

  test('handles apps:undefined', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare({ apps: undefined });

    expect(middlewares).toBeInstanceOf(Array);
  });

  test('handles apps:[]', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare({ apps: [] });

    expect(middlewares).toBeInstanceOf(Array);
  });

  test('Handles apps without a `prepareMiddleware`', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    // For less-brittle tests, we grab the list of middlewares when prepare is
    // given no apps, then compare it with the one that did.
    const { middlewares: defaultMiddlewares } = await keystone.prepare();
    const { middlewares } = await keystone.prepare({ apps: [{ foo: 'bar' }] });

    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toHaveLength(defaultMiddlewares.length);
  });

  test('filters out null middleware results', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    // For less-brittle tests, we grab the list of middlewares when prepare is
    // given no apps, then compare it with the one that did.
    const { middlewares: defaultMiddlewares } = await keystone.prepare();
    const { middlewares } = await keystone.prepare({ apps: [{ prepareMiddleware: () => {} }] });

    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toHaveLength(defaultMiddlewares.length);
  });

  test('filters out empty middleware arrays', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    // For less-brittle tests, we grab the list of middlewares when prepare is
    // given no apps, then compare it with the one that did.
    const { middlewares: defaultMiddlewares } = await keystone.prepare();
    const { middlewares } = await keystone.prepare({ apps: [{ prepareMiddleware: () => [] }] });

    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toHaveLength(defaultMiddlewares.length);
  });

  test('returns middlewares', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const middleware = jest.fn(() => {});
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare({
      apps: [{ prepareMiddleware: () => middleware }],
    });

    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toEqual(expect.arrayContaining([middleware]));
  });

  test('flattens deeply nested middlewares', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    const fn0 = jest.fn(() => {});
    const fn1 = jest.fn(() => {});
    const fn2 = jest.fn(() => {});
    const { middlewares } = await keystone.prepare({
      apps: [{ prepareMiddleware: () => [[fn0, fn1], fn2] }],
    });

    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toEqual(expect.arrayContaining([fn0, fn1, fn2]));
  });

  test('executes FIELD.prepareMiddleware()', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const mockMiddlewareFn = jest.fn(() => {});
    const MockFieldWithMiddleware = {
      prepareMiddleware: jest.fn(() => mockMiddlewareFn),
      implementation: MockFieldImplementation,
      views: {},
      adapters: { mock: MockFieldAdapter },
    };
    const keystone = new Keystone(config);
    keystone.createList('Foo', { fields: { zip: { type: MockFieldWithMiddleware } } });
    const { middlewares } = await keystone.prepare({ apps: [] });

    expect(MockFieldWithMiddleware.prepareMiddleware).toHaveBeenCalled();
    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toEqual(expect.arrayContaining([mockMiddlewareFn]));
  });

  test('orders field middlewares before app middlewares', async () => {});

  test('calls prepareMiddleware with correct params', async () => {});
});
