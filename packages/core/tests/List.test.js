// We don't want to actually log, so we mock it before we require the class
jest.doMock('@keystonejs/logger', () => {
  return jest.fn(() => ({ warn: () => {}, log: () => {} }));
});

const List = require('../List');
const { Text, Checkbox, Float } = require('@keystonejs/fields');
const { getType } = require('@keystonejs/utils');

class MockAdminMeta {}

class MockFieldAdapter {}

class MockListAdapter {
  newFieldAdapter = () => new MockFieldAdapter();
  prepareModel = () => {};
}

class MockAdapter {
  name = 'mock';
  newListAdapter = () => new MockListAdapter();
}

class MockType {
  constructor(name, { access }) {
    this.name = name;
    this.access = access;
  }
  getAdminMeta = () => new MockAdminMeta();
  getGraphqlSchema = () => `${this.name}_schema`;
  getGraphqlAuxiliaryTypes = () => `${this.name}_types`;
  getGraphqlAuxiliaryQueries = () => {};
  getGraphqlAuxiliaryMutations = () => {};
  getGraphqlUpdateArgs = () => `${this.name}_update_args`;
  getGraphqlCreateArgs = () => `${this.name}_create_args`;
  getGraphqlQueryArgs = () => `${this.name}_query_args`;
}

const config = {
  fields: {
    name: {
      type: {
        implementation: MockType,
        views: {
          viewType1: 'viewPath1',
          viewType2: 'viewPath2',
        },
        adapters: { mock: MockFieldAdapter },
      },
      access: {
        create: true,
        read: true,
        update: true,
      },
    },
    email: {
      type: {
        implementation: MockType,
        views: {
          viewType3: 'viewPath3',
          viewType4: 'viewPath4',
        },
        adapters: { mock: MockFieldAdapter },
      },
      access: {
        create: true,
        read: true,
        update: true,
      },
    },
  },
};

describe('new List()', () => {
  test('new List() - Smoke test', () => {
    const list = new List('Test', config, {
      adapter: new MockAdapter(),
      lists: [],
      getAuth: () => {},
      defaultAccess: { list: true, field: true },
    });
    expect(list).not.toBeNull();
  });

  test('new List() - labels', () => {
    const list = new List('Test', config, {
      adapter: new MockAdapter(),
      lists: [],
      getAuth: () => {},
      defaultAccess: { list: true, field: true },
    });
    expect(list.label).toEqual('Tests');
    expect(list.singular).toEqual('Test');
    expect(list.plural).toEqual('Tests');
    expect(list.path).toEqual('tests');
    expect(list.itemQueryName).toEqual('Test');
    expect(list.listQueryName).toEqual('allTests');
    expect(list.listQueryMetaName).toEqual('_allTestsMeta');
    expect(list.deleteMutationName).toEqual('deleteTest');
    expect(list.deleteManyMutationName).toEqual('deleteTests');
    expect(list.updateMutationName).toEqual('updateTest');
    expect(list.createMutationName).toEqual('createTest');
  });

  test('new List() - fields', () => {
    const list = new List('Test', config, {
      adapter: new MockAdapter(),
      lists: [],
      getAuth: () => {},
      defaultAccess: { list: true, field: true },
    });
    expect(list.fields).toHaveLength(2);
    expect(list.fields[0]).toBeInstanceOf(MockType);
    expect(list.fields[1]).toBeInstanceOf(MockType);
  });

  test('new List() - views', () => {
    const list = new List('Test', config, {
      adapter: new MockAdapter(),
      lists: [],
      getAuth: () => {},
      defaultAccess: { list: true, field: true },
    });
    expect(list.views).toEqual({
      name: {
        viewType1: 'viewPath1',
        viewType2: 'viewPath2',
      },
      email: {
        viewType3: 'viewPath3',
        viewType4: 'viewPath4',
      },
    });
  });
});

describe('getAdminMeta()', () => {
  test('adminMeta() - Smoke test', () => {
    const list = new List('Test', config, {
      adapter: new MockAdapter(),
      lists: [],
      getAuth: () => {},
      defaultAccess: { list: true, field: true },
    });
    const adminMeta = list.getAdminMeta();
    expect(adminMeta).not.toBeNull();
  });

  test('getAdminMeta() - labels', () => {
    const list = new List('Test', config, {
      adapter: new MockAdapter(),
      lists: [],
      getAuth: () => {},
      defaultAccess: { list: true, field: true },
    });
    const adminMeta = list.getAdminMeta();

    expect(adminMeta.key).toEqual('Test');
    expect(adminMeta.label).toEqual('Tests');
    expect(adminMeta.singular).toEqual('Test');
    expect(adminMeta.plural).toEqual('Tests');
    expect(adminMeta.path).toEqual('tests');
    expect(adminMeta.itemQueryName).toEqual('Test');
    expect(adminMeta.listQueryName).toEqual('allTests');
    expect(adminMeta.listQueryMetaName).toEqual('_allTestsMeta');
    expect(adminMeta.deleteMutationName).toEqual('deleteTest');
    expect(adminMeta.deleteManyMutationName).toEqual('deleteTests');
    expect(adminMeta.updateMutationName).toEqual('updateTest');
    expect(adminMeta.createMutationName).toEqual('createTest');
  });

  test('getAdminMeta() - fields', () => {
    const list = new List('Test', config, {
      adapter: new MockAdapter(),
      lists: [],
      getAuth: () => {},
      defaultAccess: { list: true, field: true },
    });
    const adminMeta = list.getAdminMeta();

    expect(adminMeta.fields).toHaveLength(2);
    expect(adminMeta.fields[0]).toBeInstanceOf(MockAdminMeta);
    expect(adminMeta.fields[1]).toBeInstanceOf(MockAdminMeta);
  });

  test('getAdminMeta() - views', () => {
    const list = new List('Test', config, {
      adapter: new MockAdapter(),
      lists: [],
      getAuth: () => {},
      defaultAccess: { list: true, field: true },
    });
    const adminMeta = list.getAdminMeta();

    expect(adminMeta.views).toEqual({
      name: {
        viewType1: 'viewPath1',
        viewType2: 'viewPath2',
      },
      email: {
        viewType3: 'viewPath3',
        viewType4: 'viewPath4',
      },
    });
  });
});

test('getAdminGraphqlTypes()', () => {
  const list = new List('Test', config, {
    adapter: new MockAdapter(),
    lists: [],
    getAuth: () => {},
    defaultAccess: { list: true, field: true },
  });
  const types = list.getAdminGraphqlTypes();

  expect(types).toEqual([
    'name_types',
    'email_types',
    `
        type Test {
          id: String
          # This virtual field will be resolved in one of the following ways (in this order):
          # 1. Execution of 'labelResolver' set on the Test List config, or
          # 2. As an alias to the field set on 'labelField' in the Test List config, or
          # 3. As an alias to a 'name' field on the Test List (if one exists), or
          # 4. As an alias to the 'id' field on the Test List.
          _label_: String
          name_schema
          email_schema
        }
      `,
    `
        input TestWhereInput {
          id: ID
          id_not: ID
          id_in: [ID!]
          id_not_in: [ID!]
          # MockType field
          name_query_args

          # MockType field
          email_query_args
        }
      `,
    `
        input TestWhereUniqueInput {
          id: ID!
        }
      `,
    `
        input TestUpdateInput {
          name_update_args
          email_update_args
        }
      `,
    `
        input TestCreateInput {
          name_create_args
          email_create_args
        }
      `,
  ]);
});

test('getAdminGraphqlQueries()', () => {
  const list = new List('Test', config, {
    adapter: new MockAdapter(),
    lists: [],
    getAuth: () => {},
    defaultAccess: { list: true, field: true },
  });
  const queries = list.getAdminGraphqlQueries();

  expect(queries).toEqual([
    `
        allTests(
          where: TestWhereInput

          search: String
          orderBy: String

          # Pagination
          first: Int
          skip: Int
        ): [Test]

        Test(where: TestWhereUniqueInput!): Test

        _allTestsMeta(
          where: TestWhereInput

          search: String
          orderBy: String

          # Pagination
          first: Int
          skip: Int
        ): _QueryMeta

        _TestsMeta: _ListMeta
      `,
  ]);
});

test('getAdminGraphqlMutations()', () => {
  const list = new List('Test', config, {
    adapter: new MockAdapter(),
    lists: [],
    getAuth: () => {},
    defaultAccess: { list: true, field: true },
  });
  const mutations = list.getAdminGraphqlMutations().map(mute => mute.trim());

  expect(mutations).toEqual([
    `
        createTest(
          data: TestCreateInput
        ): Test
    `.trim(),
    `
        updateTest(
          id: ID!
          data: TestUpdateInput
        ): Test
    `.trim(),
    `
        deleteTest(
          id: ID!
        ): Test
    `.trim(),
    `
        deleteTests(
          ids: [ID!]
        ): [Test]
     `.trim(),
  ]);
});

test('getAdminQueryResolvers()', () => {
  const list = new List('Test', config, {
    adapter: new MockAdapter(),
    lists: [],
    getAuth: () => {},
    defaultAccess: { list: true, field: true },
  });
  const resolvers = list.getAdminQueryResolvers();

  expect(resolvers['Test']).toBeInstanceOf(Function);
  expect(resolvers['allTests']).toBeInstanceOf(Function);
  expect(resolvers['_allTestsMeta']).toBeInstanceOf(Function);
});

test('getAdminMutationResolvers()', () => {
  const list = new List('Test', config, {
    adapter: new MockAdapter(),
    lists: [],
    getAuth: () => {},
    defaultAccess: { list: true, field: true },
  });
  const resolvers = list.getAdminMutationResolvers();

  expect(resolvers['createTest']).toBeInstanceOf(Function);
  expect(resolvers['updateTest']).toBeInstanceOf(Function);
  expect(resolvers['deleteTest']).toBeInstanceOf(Function);
  expect(resolvers['deleteTests']).toBeInstanceOf(Function);
});

describe('Maps from Native JS types to Keystone types', () => {
  const adapter = new MockAdapter();

  [
    {
      nativeType: Boolean,
      keystoneType: Checkbox,
    },
    {
      nativeType: String,
      keystoneType: Text,
    },
    {
      nativeType: Number,
      keystoneType: Float,
    },
  ].forEach(({ nativeType, keystoneType }) => {
    test(`${getType(nativeType.prototype)} -> ${keystoneType.type}`, () => {
      const list = new List(
        'Test',
        { fields: { foo: { type: nativeType } } },
        {
          adapter,
          getAuth: () => {},
          defaultAccess: { list: true, field: true },
        }
      );
      expect(list.fieldsByPath.foo).toBeInstanceOf(keystoneType.implementation);
    });
  });
});
