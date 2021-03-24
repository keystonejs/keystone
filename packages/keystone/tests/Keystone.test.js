const Keystone = require('../lib/Keystone');
const { List } = require('../lib/ListTypes');
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

describe('Keystone.createList()', () => {
  test('basic', () => {
    const config = {
      adapter: new MockAdapter(),
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

  test('Reserved words', () => {
    const config = {
      adapter: new MockAdapter(),
    };
    const keystone = new Keystone(config);

    for (const listName of ['Query', 'Mutation', 'Subscription']) {
      expect(() => keystone.createList(listName, {})).toThrow(
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

  test('plugins', () => {
    const config = {
      adapter: new MockAdapter(),
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
