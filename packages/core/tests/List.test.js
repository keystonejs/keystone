const gql = require('graphql-tag');
const { print } = require('graphql/language/printer');

// We don't want to actually log, so we mock it before we require the class
jest.doMock('@voussoir/logger', () => {
  return jest.fn(() => ({ warn: () => {}, log: () => {} }));
});

const List = require('../List');
const { Text, Checkbox, Float } = require('@voussoir/fields');
const { getType } = require('@voussoir/utils');

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
  get gqlOutputFields() {
    return [`${this.name}_field: String`];
  }
  get gqlAuxTypes() {
    return [`type ${this.name}_type { x: Int }`];
  }
  get gqlAuxQueries() {
    return [];
  }
  get gqlAuxMutations() {
    return [];
  }
  get gqlUpdateInputFields() {
    return [`${this.name}_update_arg: String`];
  }
  get gqlCreateInputFields() {
    return [`${this.name}_create_arg: String`];
  }
  get gqlQueryInputFields() {
    return [`${this.name}_query_arg: String`];
  }
}

// Convert a gql field into a normalised format for comparison.
// Needs to be wrapped in a mock type for gql to correctly parse it.
const normalise = s => print(gql(`type t { ${s} }`));

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
    expect(adminMeta.gqlNames.itemQueryName).toEqual('Test');
    expect(adminMeta.gqlNames.listQueryName).toEqual('allTests');
    expect(adminMeta.gqlNames.listQueryMetaName).toEqual('_allTestsMeta');
    expect(adminMeta.gqlNames.deleteMutationName).toEqual('deleteTest');
    expect(adminMeta.gqlNames.deleteManyMutationName).toEqual('deleteTests');
    expect(adminMeta.gqlNames.updateMutationName).toEqual('updateTest');
    expect(adminMeta.gqlNames.createMutationName).toEqual('createTest');
    expect(adminMeta.gqlNames.whereInputName).toEqual('TestWhereInput');
    expect(adminMeta.gqlNames.whereUniqueInputName).toEqual('TestWhereUniqueInput');
    expect(adminMeta.gqlNames.updateInputName).toEqual('TestUpdateInput');
    expect(adminMeta.gqlNames.createInputName).toEqual('TestCreateInput');
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

test('gqlTypes', () => {
  const list = new List('Test', config, {
    adapter: new MockAdapter(),
    lists: [],
    getAuth: () => {},
    defaultAccess: { list: true, field: true },
  });
  const types = list.gqlTypes.map(s => print(gql(s)));

  expect(types).toEqual(
    [
      'type name_type { x: Int }',
      'type email_type { x: Int }',
      `type Test {
      id: ID
      """
      This virtual field will be resolved in one of the following ways (in this order):
      1. Execution of 'labelResolver' set on the Test List config, or
      2. As an alias to the field set on 'labelField' in the Test List config, or
      3. As an alias to a 'name' field on the Test List (if one exists), or
      4. As an alias to the 'id' field on the Test List.
      """
      _label_: String
      name_field: String
      email_field: String
    }`,
      `input TestWhereInput {
      id: ID
      id_not: ID
      id_in: [ID!]
      id_not_in: [ID!]
      AND: [TestWhereInput]
      OR: [TestWhereInput]
      name_query_arg: String
      email_query_arg: String
    }`,
      `input TestWhereUniqueInput {
      id: ID!
    }`,
      `input TestUpdateInput {
      name_update_arg: String
      email_update_arg: String
    }`,
      `input TestCreateInput {
      name_create_arg: String
      email_create_arg: String
    }`,
    ].map(s => print(gql(s)))
  );
});

test('gqlQueries', () => {
  const list = new List('Test', config, {
    adapter: new MockAdapter(),
    lists: [],
    getAuth: () => {},
    defaultAccess: { list: true, field: true },
  });
  const queries = list.gqlQueries.map(normalise);

  expect(queries).toEqual(
    [
      `allTests(
      where: TestWhereInput
      search: String
      orderBy: String
      first: Int
      skip: Int
    ): [Test]`,
      `Test(
      where: TestWhereUniqueInput!
    ): Test`,
      `_allTestsMeta(
      where: TestWhereInput
      search: String
      orderBy: String
      first: Int
      skip: Int
    ): _QueryMeta`,
      `_TestsMeta: _ListMeta`,
    ].map(normalise)
  );
});

test('gqlMutations', () => {
  const list = new List('Test', config, {
    adapter: new MockAdapter(),
    lists: [],
    getAuth: () => {},
    defaultAccess: { list: true, field: true },
  });
  const mutations = list.gqlMutations.map(normalise);

  expect(mutations).toEqual(
    [
      `createTest(
      data: TestCreateInput
    ): Test`,
      `updateTest(
      id: ID!
      data: TestUpdateInput
    ): Test`,
      `deleteTest(
      id: ID!
    ): Test`,
      `deleteTests(
      ids: [ID!]
    ): [Test]`,
    ].map(normalise)
  );
});

test('gqlQueryResolvers', () => {
  const list = new List('Test', config, {
    adapter: new MockAdapter(),
    lists: [],
    getAuth: () => {},
    defaultAccess: { list: true, field: true },
  });
  const resolvers = list.gqlQueryResolvers;

  expect(resolvers['Test']).toBeInstanceOf(Function);
  expect(resolvers['allTests']).toBeInstanceOf(Function);
  expect(resolvers['_allTestsMeta']).toBeInstanceOf(Function);
});

test('gqlMutationResolvers', () => {
  const list = new List('Test', config, {
    adapter: new MockAdapter(),
    lists: [],
    getAuth: () => {},
    defaultAccess: { list: true, field: true },
  });
  const resolvers = list.gqlMutationResolvers;

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
