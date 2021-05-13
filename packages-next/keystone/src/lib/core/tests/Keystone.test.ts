import { PrismaAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Keystone } from '../Keystone/index';
import { List } from '../ListTypes';

class MockFieldAdapter {}

class MockFieldImplementation {
  name: string;
  access: any;
  config: any;
  constructor(name: string) {
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
  gqlUpdateInputFields() {
    return ['zap: Boolean'];
  }
  gqlCreateInputFields() {
    return ['quux: Boolean'];
  }
  getGqlAuxQueries() {
    return ['getFoo: Boolean'];
  }
}

const MockFieldType = {
  implementation: MockFieldImplementation,
  adapter: MockFieldAdapter,
};

class MockListAdapter {
  parentAdapter: MockAdapter;
  constructor(parentAdapter: MockAdapter) {
    this.parentAdapter = parentAdapter;
  }
  key = 'mock';
  newFieldAdapter = () => new MockFieldAdapter();
}

class MockAdapter {
  name = 'mock';
  newListAdapter = () => new MockListAdapter(this);
}

test('Check require', () => {
  expect(Keystone).not.toBeNull();
});

describe('Keystone.createList()', () => {
  test('basic', () => {
    const config = {
      adapter: new MockAdapter() as unknown as PrismaAdapter,
      onConnect: async () => {},
      queryLimits: {},
    };
    const keystone = new Keystone(config);

    expect(keystone.lists).toEqual({});
    expect(keystone.listsArray).toEqual([]);

    keystone.createList('User', {
      fields: {
        id: { type: MockFieldType },
        name: { type: MockFieldType },
        email: { type: MockFieldType },
      },
      access: true,
    });

    expect(keystone.lists).toHaveProperty('User');
    expect(keystone.lists['User']).toBeInstanceOf(List);
    expect(keystone.listsArray).toHaveLength(1);
    expect(keystone.listsArray[0]).toBeInstanceOf(List);

    expect(keystone.listsArray[0]).toBe(keystone.lists['User']);
  });

  test('Reserved words', () => {
    const config = {
      adapter: new MockAdapter() as unknown as PrismaAdapter,
      onConnect: async () => {},
      queryLimits: {},
    };
    const keystone = new Keystone(config);

    for (const listName of ['Query', 'Mutation', 'Subscription']) {
      expect(() => keystone.createList(listName, { fields: [], access: true })).toThrow(
        `Invalid list name "${listName}". List names cannot be reserved GraphQL keywords`
      );
    }
  });

  /* eslint-disable jest/no-disabled-tests */
  describe('access control config', () => {
    test.todo('expands shorthand acl config');
    test.todo('throws error when one of create/read/update/delete not set on object');
    test.todo('throws error when create/read/update/delete are not correct type');
  });
  /* eslint-enable jest/no-disabled-tests */
});
