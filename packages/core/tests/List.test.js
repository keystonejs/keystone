const { Mongoose } = require('mongoose');
const List = require('../List');

class MockAdminMeta {}

class MockType {
  constructor(name) {
    this.name = name;
  }
  addToMongooseSchema = jest.fn();
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
      },
    },
    email: {
      type: {
        implementation: MockType,
        views: {
          viewType3: 'viewPath3',
          viewType4: 'viewPath4',
        },
      },
    },
  },
};

describe('new List()', () => {
  test('new List() - Smoke test', () => {
    const list = new List('Test', config, {
      mongoose: new Mongoose(),
      lists: [],
    });
    expect(list).not.toBeNull();
  });

  test('new List() - labels', () => {
    const list = new List('Test', config, {
      mongoose: new Mongoose(),
      lists: [],
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
      mongoose: new Mongoose(),
      lists: [],
    });
    expect(list.fields).toHaveLength(2);
    expect(list.fields[0]).toBeInstanceOf(MockType);
    expect(list.fields[1]).toBeInstanceOf(MockType);
  });

  test('new List() - views', () => {
    const list = new List('Test', config, {
      mongoose: new Mongoose(),
      lists: [],
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
      mongoose: new Mongoose(),
      lists: [],
    });
    const adminMeta = list.getAdminMeta();
    expect(adminMeta).not.toBeNull();
  });

  test('getAdminMeta() - labels', () => {
    const list = new List('Test', config, {
      mongoose: new Mongoose(),
      lists: [],
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
      mongoose: new Mongoose(),
      lists: [],
    });
    const adminMeta = list.getAdminMeta();

    expect(adminMeta.fields).toHaveLength(2);
    expect(adminMeta.fields[0]).toBeInstanceOf(MockAdminMeta);
    expect(adminMeta.fields[1]).toBeInstanceOf(MockAdminMeta);
  });

  test('getAdminMeta() - views', () => {
    const list = new List('Test', config, {
      mongoose: new Mongoose(),
      lists: [],
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
    mongoose: new Mongoose(),
    lists: [],
  });
  const types = list.getAdminGraphqlTypes();

  expect(types).toEqual([
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
    'name_types',
    'email_types',
  ]);
});

test('getAdminGraphqlQueries()', () => {
  const list = new List('Test', config, {
    mongoose: new Mongoose(),
    lists: [],
  });
  const queries = list.getAdminGraphqlQueries();

  expect(queries).toEqual([`
        allTests(
          search: String
          sort: String

          # Pagination
          first: Int
          skip: Int

          # Field Filters
          name_query_args
          # New field
          email_query_args
        ): [Test]

        Test(id: String!): Test

        _allTestsMeta(
          search: String
          sort: String

          # Pagination
          first: Int
          skip: Int

          # Field Filters
          name_query_args
          # New field
          email_query_args
        ): _QueryMeta
      `]);
});

test('getAdminGraphqlMutations()', () => {
  const list = new List('Test', config, {
    mongoose: new Mongoose(),
    lists: [],
  });
  const mutations = list.getAdminGraphqlMutations().map(mute => mute.trim());

  expect(mutations).toEqual([`
        createTest(
          data: TestUpdateInput
        ): Test
        updateTest(
          id: String!
          data: TestUpdateInput
        ): Test
        deleteTest(
          id: String!
        ): Test
        deleteTests(
          ids: [String!]
        ): Test
     `.trim()]);
});

test('getAdminQueryResolvers()', () => {
  const list = new List('Test', config, {
    mongoose: new Mongoose(),
    lists: [],
  });
  const resolvers = list.getAdminQueryResolvers();

  expect(resolvers['Test']).toBeInstanceOf(Function);
  expect(resolvers['allTests']).toBeInstanceOf(Function);
  expect(resolvers['_allTestsMeta']).toBeInstanceOf(Function);
});

test('getAdminMutationResolvers()', () => {
  const list = new List('Test', config, {
    mongoose: new Mongoose(),
    lists: [],
  });
  const resolvers = list.getAdminMutationResolvers();

  expect(resolvers['createTest']).toBeInstanceOf(Function);
  expect(resolvers['updateTest']).toBeInstanceOf(Function);
  expect(resolvers['deleteTest']).toBeInstanceOf(Function);
  expect(resolvers['deleteTests']).toBeInstanceOf(Function);
});
