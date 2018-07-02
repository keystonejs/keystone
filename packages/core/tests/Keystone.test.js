const Keystone = require('../Keystone');
const List = require('../List');
const { Text, Relationship } = require('@keystonejs/fields');

class MockType {
  addToMongooseSchema = jest.fn();
}

test('Check require', () => {
  expect(Keystone).not.toBeNull();
});

test('new Keystone()', () => {
  const config = {
    name: 'Jest Test',
  };
  const keystone = new Keystone(config);
  expect(keystone.config).toBe(config);
});

test('Keystone.createList()', () => {
  const config = {
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
        },
      },
      email: {
        type: {
          implementation: MockType,
          views: {},
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
      itemsQuery: jest.fn(),
      model: {
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
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
      itemsQuery: jest.fn(),
      model: {
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
      },
    },
  };

  function setupMocks(keystone) {
    const created = {};

    // Create mocks
    let id = 1;
    keystone.createItem = jest.fn().mockImplementation((listKey, input) => {
      const newItem = { id: id++, ...input };
      created[listKey] = created[listKey] || [];
      created[listKey].push(newItem);
      return newItem;
    });

    Object.keys(lists).forEach(listKey => {
      // Update mocks
      lists[listKey].model.findByIdAndUpdate.mockImplementation((_, data) => data);
    });

    // Query mocks
    lists.User.itemsQuery.mockImplementation(({ where: { name } }) =>
      created.User.filter(item => item.name === name)
    );
    lists.Post.itemsQuery.mockImplementation(({ where: { title } }) =>
      created.Post.filter(item => item.title === title)
    );
  }

  beforeEach(() => {
    // Reset call counts, etc, back to normal
    lists.User.itemsQuery.mockReset();
    lists.User.model.findByIdAndUpdate.mockReset();
    lists.User.model.findByIdAndDelete.mockReset();
    lists.Post.itemsQuery.mockReset();
    lists.Post.model.findByIdAndUpdate.mockReset();
    lists.Post.model.findByIdAndDelete.mockReset();
  });

  test('creates items', async () => {
    const keystone = new Keystone({
      name: 'Jest Test',
    });

    // mock the lists
    keystone.lists = lists;

    await keystone.createItems({
      User: [{ name: 'Jess' }, { name: 'Lauren' }],
      Post: [{ title: 'Hello world' }, { title: 'Goodbye' }],
    });

    expect(keystone.createItem).toHaveBeenCalledWith('User', {
      name: 'Jess',
    });
    expect(keystone.createItem).toHaveBeenCalledWith('User', {
      name: 'Lauren',
    });
    expect(keystone.createItem).toHaveBeenCalledWith('Post', {
      title: 'Hello world',
    });
    expect(keystone.createItem).toHaveBeenCalledWith('Post', {
      title: 'Goodbye',
    });
  });

  test('returns the created items', async () => {
    const keystone = new Keystone({
      name: 'Jest Test',
    });

    // mock the lists
    keystone.lists = lists;

    setupMocks(keystone);

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
      name: 'Jest Test',
    });

    // mock the lists
    keystone.lists = lists;

    setupMocks(keystone);

    const createdItems = await keystone.createItems({
      User: [{ name: 'Jess' }, { name: 'Lauren' }],
      Post: [
        { title: 'Hello world', author: { where: { name: 'Lauren' } } },
        { title: 'Goodbye', author: { where: { name: 'Jess' } } },
      ],
    });

    expect(createdItems).toEqual({
      User: [{ id: 1, name: 'Jess' }, { id: 2, name: 'Lauren' }],
      Post: [
        { id: 3, title: 'Hello world', author: 2 },
        { id: 4, title: 'Goodbye', author: 1 },
      ],
    });
  });

  test('deletes created items when relationships fail', async () => {
    const keystone = new Keystone({
      name: 'Jest Test',
    });

    // mock the lists
    keystone.lists = lists;

    setupMocks(keystone);

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
      expect(keystone.lists.User.model.findByIdAndDelete).toHaveBeenCalledWith(1);
      expect(keystone.lists.User.model.findByIdAndDelete).toHaveBeenCalledWith(2);
      expect(keystone.lists.Post.model.findByIdAndDelete).toHaveBeenCalledWith(3);
      expect(keystone.lists.Post.model.findByIdAndDelete).toHaveBeenCalledWith(4);
    }
  });
});
