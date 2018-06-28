const Keystone = require('../Keystone');
const List = require('../List');
const { Text, Relationship } = require('@keystonejs/fields');

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
  expect(keystone.config).toBe(config);
});

test('Keystone.createList()', () => {
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

    await keystone.createItems({
      User: [
        { name: 'Jess' },
        { name: 'Lauren' },
      ],
      Post: [
        { title: 'Hello world' },
        { title: 'Goodbye' },
      ],
    });

    expect(keystone.lists.User.adapter.create).toHaveBeenCalledWith({ name: 'Jess' });
    expect(keystone.lists.User.adapter.create).toHaveBeenCalledWith({ name: 'Lauren' });
    expect(keystone.lists.Post.adapter.create).toHaveBeenCalledWith({ title: 'Hello world' });
    expect(keystone.lists.Post.adapter.create).toHaveBeenCalledWith({ title: 'Goodbye' });
  });
});
