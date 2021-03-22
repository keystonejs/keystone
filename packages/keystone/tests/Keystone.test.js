const isPromise = require('p-is-promise');
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

describe('Keystone.createList()', () => {
  test('basic', () => {
    const config = {
      adapter: new MockAdapter(),
      cookieSecret: 'secretForTesting',
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
      cookieSecret: 'secretForTesting',
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
      cookieSecret: 'secretForTesting',
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

describe('keystone.prepare()', () => {
  test('returns a Promise', () => {
    const config = {
      adapter: new MockAdapter(),
      cookieSecret: 'secretForTesting',
    };
    const keystone = new Keystone(config);

    // NOTE: We add a `.catch()` to silence the "unhandled promise rejection"
    // warning
    expect(isPromise(keystone.prepare().catch(() => {}))).toBeTruthy();
  });

  test('returns the middlewares array', async () => {
    const config = {
      adapter: new MockAdapter(),
      cookieSecret: 'secretForTesting',
    };
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare();

    expect(middlewares).toBeInstanceOf(Array);
  });

  test('handles apps:undefined', async () => {
    const config = {
      adapter: new MockAdapter(),
      cookieSecret: 'secretForTesting',
    };
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare({ apps: undefined });

    expect(middlewares).toBeInstanceOf(Array);
  });

  test('handles apps:[]', async () => {
    const config = {
      adapter: new MockAdapter(),
      cookieSecret: 'secretForTesting',
    };
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare({ apps: [] });

    expect(middlewares).toBeInstanceOf(Array);
  });

  test('Handles apps without a `prepareMiddleware`', async () => {
    const config = {
      adapter: new MockAdapter(),
      cookieSecret: 'secretForTesting',
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
      cookieSecret: 'secretForTesting',
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
      cookieSecret: 'secretForTesting',
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
      cookieSecret: 'secretForTesting',
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
      cookieSecret: 'secretForTesting',
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

  test('should create `internal` GraphQL schema instance', async () => {
    const config = {
      adapter: new MockAdapter(),
      cookieSecret: 'secretForTesting',
    };
    const keystone = new Keystone(config);

    // Prepare middlewares
    await keystone.prepare();

    expect(keystone._schemas['internal']).not.toBe(null);
  });

  test('orders field middlewares before app middlewares', async () => {});

  test('calls prepareMiddleware with correct params', async () => {});
});
