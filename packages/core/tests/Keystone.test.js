const Keystone = require('../Keystone');
const List = require('../List');

class MockType {
  addToMongooseSchema = jest.fn();
};

test('Check require', () => {
  expect(Keystone).not.toBeNull();
});

test('new Keystone()', () => {
  const config = {
    name: 'Jest Test'
  };
  const keystone = new Keystone(config);
  expect(keystone.config).toBe(config);
});


test('Keystone.createList()', () => {
  const config = {
    name: 'Jest Test'
  };
  const keystone = new Keystone(config);

  expect(keystone.lists).toEqual({});
  expect(keystone.listsArray).toEqual([]);

  keystone.createList('User', {
    fields: {
      name: { type: {
        implementation: MockType,
        views: {},
      } },
      email: { type: {
        implementation: MockType,
        views: {},
      }, },
    }
  });

  expect(keystone.lists).toHaveProperty('User');
  expect(keystone.lists['User']).toBeInstanceOf(List);
  expect(keystone.listsArray).toHaveLength(1);
  expect(keystone.listsArray[0]).toBeInstanceOf(List);

  expect(keystone.listsArray[0]).toBe(keystone.lists['User']);
});
