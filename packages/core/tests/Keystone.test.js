const Keystone = require('../Keystone');
const List = require('../List');
const { Text, Relationship } = require('@voussoir/fields');

class MockType {}

class MockFieldAdapter {}

class MockListAdapter {
  newFieldAdapter = () => new MockFieldAdapter();
  prepareModel = () => {};
}

class MockAdapter {
  name = 'mock';
  newListAdapter = () => new MockListAdapter();
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
  expect(keystone.config).toEqual(config);
});

test('unique typeDefs', () => {
  class MockFileType {
    constructor() {
      this.access = {
        create: true,
        read: true,
        update: true,
        delete: true,
      };
    }
    getGqlAuxTypes() {
      return ['scalar Foo'];
    }
    get gqlOutputFields() {
      return ['foo: Boolean'];
    }
    get gqlQueryInputFields() {
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
  }

  const config = {
    adapter: new MockAdapter(),
    name: 'Jest Test for typeDefs',
  };
  const keystone = new Keystone(config);

  keystone.createList('User', {
    fields: {
      images: {
        type: {
          implementation: MockFileType,
          views: {},
          adapters: { mock: MockFieldAdapter },
        },
      },
    },
  });

  keystone.createList('Post', {
    fields: {
      hero: {
        type: {
          implementation: MockFileType,
          views: {},
          adapters: { mock: MockFieldAdapter },
        },
      },
    },
  });

  const schema = keystone.getTypeDefs().join('\n');
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
        name: {
          type: {
            implementation: MockType,
            views: {},
            adapters: { mock: MockFieldAdapter },
          },
        },
        email: {
          type: {
            implementation: MockType,
            views: {},
            adapters: { mock: MockFieldAdapter },
          },
        },
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
    test.failing('expands shorthand acl config', () => {
      expect(false).toBe(true);
    });

    test.failing('throws error when one of create/read/update/delete not set on object', () => {
      expect(false).toBe(true);
    });

    test.failing('throws error when create/read/update/delete are not correct type', () => {
      expect(false).toBe(true);
    });
  });
  /* eslint-enable jest/no-disabled-tests */
});

describe('Keystone.createItems()', () => {
  const lists = {
    User: {
      key: 'User',
      config: {
        fields: {
          name: { type: Text },
          posts: { type: Relationship, many: true, ref: 'Post' },
        },
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
      config: {
        fields: {
          title: { type: Text },
          author: { type: Relationship, ref: 'User' },
        },
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

    setupMocks(keystone);

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
