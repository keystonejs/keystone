const Keystone = require('../Keystone');
const List = require('../List');

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
