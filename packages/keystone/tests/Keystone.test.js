const isPromise = require('p-is-promise');
const Keystone = require('../lib/Keystone');
const List = require('../lib/List');
const { Text, Relationship } = require('@keystone-alpha/fields');

class MockFieldAdapter {}

class MockFieldImplementation {
  constructor(name) {
    this.access = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
    this.config = {};
    this.name = name;
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
    expect(middlewares).toHaveLength(0);
  });

  test('handles apps:[]', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare({ apps: [] });

    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toHaveLength(0);
  });

  test('Handles apps without a `prepareMiddleware`', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare({ apps: [{ foo: 'bar' }] });

    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toHaveLength(0);
  });

  test('filters out null middleware results', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare({ apps: [{ prepareMiddleware: () => {} }] });

    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toHaveLength(0);
  });

  test('filters out empty middleware arrays', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare({ apps: [{ prepareMiddleware: () => [] }] });

    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toHaveLength(0);
  });

  test('returns middlewares', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    const { middlewares } = await keystone.prepare({
      apps: [{ prepareMiddleware: () => () => {} }],
    });

    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toHaveLength(1);
  });

  test('flattens deeply nested middlewares', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const keystone = new Keystone(config);
    const fn0 = () => {};
    const fn1 = () => {};
    const fn2 = () => {};
    const { middlewares } = await keystone.prepare({
      apps: [{ prepareMiddleware: () => [[fn0, fn1], fn2] }],
    });

    expect(middlewares).toBeInstanceOf(Array);
    expect(middlewares).toHaveLength(3);
    expect(middlewares[0]).toBe(fn0);
    expect(middlewares[1]).toBe(fn1);
    expect(middlewares[2]).toBe(fn2);
  });

  test('executes FIELD.prepareMiddleware()', async () => {
    const config = {
      adapter: new MockAdapter(),
      name: 'Jest Test',
    };
    const mockMiddlewareFn = () => {};
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
    expect(middlewares).toHaveLength(1);
    expect(middlewares[0]).toBe(mockMiddlewareFn);
  });

  test('orders field middlewares before app middlewares', async () => {});

  test('calls prepareMiddleware with correct params', async () => {});
});
