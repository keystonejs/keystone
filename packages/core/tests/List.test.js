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
  getGraphqlOutputFields = () => [{ name: `${this.name}_schema`, type: 'String' }];
  getGraphqlAuxiliaryTypes = () => [{ prefix: 'input', name: `${this.name}_types`, args: [] }];
  getGraphqlAuxiliaryQueries = () => [];
  getGraphqlAuxiliaryMutations = () => [];
  getGraphqlUpdateArgs = () => [{ name: `${this.name}_update_args`, type: 'String' }];
  getGraphqlCreateArgs = () => [{ name: `${this.name}_create_args`, type: 'String' }];
  getGraphqlQueryArgs = () => [{ name: `${this.name}_query_args`, type: 'String' }];
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
    expect(list.adminUILabels.label).toEqual('Tests');
    expect(list.adminUILabels.singular).toEqual('Test');
    expect(list.adminUILabels.plural).toEqual('Tests');
    expect(list.adminUILabels.path).toEqual('tests');
    expect(list.gqlNames.itemQueryName).toEqual('Test');
    expect(list.gqlNames.listQueryName).toEqual('allTests');
    expect(list.gqlNames.listQueryMetaName).toEqual('_allTestsMeta');
    expect(list.gqlNames.deleteMutationName).toEqual('deleteTest');
    expect(list.gqlNames.deleteManyMutationName).toEqual('deleteTests');
    expect(list.gqlNames.updateMutationName).toEqual('updateTest');
    expect(list.gqlNames.createMutationName).toEqual('createTest');
    expect(list.gqlNames.whereInputName).toEqual('TestWhereInput');
    expect(list.gqlNames.whereUniqueInputName).toEqual('TestWhereUniqueInput');
    expect(list.gqlNames.updateInputName).toEqual('TestUpdateInput');
    expect(list.gqlNames.createInputName).toEqual('TestCreateInput');
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
    expect(adminMeta.whereInputName).toEqual('TestWhereInput');
    expect(adminMeta.whereUniqueInputName).toEqual('TestWhereUniqueInput');
    expect(adminMeta.updateInputName).toEqual('TestUpdateInput');
    expect(adminMeta.createInputName).toEqual('TestCreateInput');
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
    { prefix: 'input', name: 'name_types', args: [] },
    { prefix: 'input', name: 'email_types', args: [] },
    {
      prefix: 'type',
      name: `Test`,
      args: [
        { name: 'id', type: 'ID' },
        {
          comment: `This virtual field will be resolved in one of the following ways (in this order):`,
        },
        { comment: `1. Execution of 'labelResolver' set on the Test List config, or` },
        { comment: `2. As an alias to the field set on 'labelField' in the Test List config, or` },
        { comment: `3. As an alias to a 'name' field on the Test List (if one exists), or` },
        { comment: `4. As an alias to the 'id' field on the Test List.` },
        { name: '_label_', type: 'String' },
        { name: 'name_schema', type: 'String' },
        { name: 'email_schema', type: 'String' },
      ],
    },
    {
      prefix: 'input',
      name: `TestWhereInput`,
      args: [
        { name: 'id', type: 'ID' },
        { name: 'id_not', type: 'ID' },
        { name: 'id_in', type: '[ID!]' },
        { name: 'id_not_in', type: '[ID!]' },
        { blank: true },
        { comment: 'MockType field' },
        { name: 'name_query_args', type: 'String' },
        { blank: true },
        { comment: 'MockType field' },
        { name: 'email_query_args', type: 'String' },
        { blank: true },
        { name: 'AND', type: '[TestWhereInput]' },
      ],
    },
    {
      prefix: 'input',
      name: `TestWhereUniqueInput`,
      args: [{ name: 'id', type: 'ID!' }],
    },
    {
      prefix: 'input',
      name: `TestUpdateInput`,
      args: [
        { name: 'name_update_args', type: 'String' },
        { name: 'email_update_args', type: 'String' },
      ],
    },
    {
      prefix: 'input',
      name: `TestCreateInput`,
      args: [
        { name: 'name_create_args', type: 'String' },
        { name: 'email_create_args', type: 'String' },
      ],
    },
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
    {
      name: 'allTests',
      args: [
        { name: 'where', type: 'TestWhereInput' },
        { name: 'search', type: 'String' },
        { name: 'orderBy', type: 'String' },
        { blank: true },
        { comment: 'Pagination' },
        { name: 'first', type: 'Int' },
        { name: 'skip', type: 'Int' },
      ],
      type: '[Test]',
    },
    { name: 'Test', args: [{ name: 'where', type: 'TestWhereUniqueInput!' }], type: 'Test' },
    {
      name: '_allTestsMeta',
      args: [
        { name: 'where', type: 'TestWhereInput' },
        { name: 'search', type: 'String' },
        { name: 'orderBy', type: 'String' },
        { blank: true },
        { comment: 'Pagination' },
        { name: 'first', type: 'Int' },
        { name: 'skip', type: 'Int' },
      ],
      type: '_QueryMeta',
    },
    { name: '_TestsMeta', args: [], type: '_ListMeta' },
  ]);
});

test('getAdminGraphqlMutations()', () => {
  const list = new List('Test', config, {
    adapter: new MockAdapter(),
    lists: [],
    getAuth: () => {},
    defaultAccess: { list: true, field: true },
  });
  const mutations = list.getAdminGraphqlMutations();

  expect(mutations).toEqual([
    { name: 'createTest', args: [{ name: 'data', type: 'TestCreateInput' }], type: 'Test' },
    {
      name: 'updateTest',
      args: [{ name: 'id', type: 'ID!' }, { name: 'data', type: 'TestUpdateInput' }],
      type: 'Test',
    },
    { name: 'deleteTest', args: [{ name: 'id', type: 'ID!' }], type: 'Test' },
    {
      name: 'deleteTests',
      args: [{ name: 'ids', type: '[ID!]' }],
      type: '[Test]',
    },
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
