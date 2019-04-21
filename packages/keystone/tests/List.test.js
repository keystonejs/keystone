const gql = require('graphql-tag');
const { print } = require('graphql/language/printer');

// We don't want to actually log, so we mock it before we require the class
jest.doMock('@keystone-alpha/logger', () => ({
  logger: jest.fn(() => ({ warn: () => {}, log: () => {}, debug: () => {}, info: () => {} })),
}));

const List = require('../lib/List');
const { AccessDeniedError } = require('../lib/List/graphqlErrors');
const { Text, Checkbox, Float, Relationship } = require('@keystone-alpha/fields');
const { getType } = require('@keystone-alpha/utils');
const path = require('path');

let fieldsPackagePath = path.dirname(require.resolve('@keystone-alpha/fields/package.json'));
function resolveViewPath(viewPath) {
  return path.join(fieldsPackagePath, 'src', 'types', viewPath);
}

class MockFieldAdapter {}

class MockListAdapter {
  constructor() {
    this.index = 3;
    this.items = {
      0: { name: 'a', email: 'a@example.com', index: 0 },
      1: { name: 'b', email: 'b@example.com', index: 1 },
      2: { name: 'c', email: 'c@example.com', index: 2 },
    };
  }
  newFieldAdapter = () => new MockFieldAdapter();
  create = async item => {
    this.items[this.index] = {
      ...item,
      index: this.index,
    };
    this.index += 1;
    return this.items[this.index - 1];
  };
  findById = id => this.items[id];
  delete = async id => {
    this.items[id] = undefined;
  };
  itemsQuery = ({ where: { id_in: ids, id, id_not_in } }) => {
    return id
      ? [this.items[id]]
      : ids.filter(i => !id_not_in || !id_not_in.includes(i)).map(i => this.items[i]);
  };
  itemsQueryMeta = async ({ where: { id_in: ids, id, id_not_in } }) => {
    return {
      count: (id
        ? [this.items[id]]
        : ids.filter(i => !id_not_in || !id_not_in.includes(i)).map(i => this.items[i])
      ).length,
    };
  };
  update = (id, item) => {
    this.items[id] = { ...this.items[id], ...item };
    return this.items[id];
  };
}

class MockAdapter {
  name = 'mock';
  newListAdapter = () => new MockListAdapter();
}

Text.adapters['mock'] = {};
Checkbox.adapters['mock'] = {};
Float.adapters['mock'] = {};
Relationship.adapters['mock'] = {};

const context = {
  getListAccessControlForUser: () => true,
  getFieldAccessControlForUser: (listKey, fieldPath, existingItem) =>
    !(existingItem && existingItem.makeFalse && fieldPath === 'name'),
  authedItem: {
    id: 1,
  },
  authedListKey: 'Test',
};

// Convert a gql field into a normalised format for comparison.
// Needs to be wrapped in a mock type for gql to correctly parse it.
const normalise = s => print(gql(`type t { ${s} }`));

const config = {
  fields: {
    name: { type: Text },
    email: { type: Text },
    other: { type: Relationship, ref: 'Other' },
    hidden: { type: Text, access: { read: false, create: true, update: true, delete: true } },
    writeOnce: { type: Text, access: { read: true, create: true, update: false, delete: true } },
  },
};

const getListByKey = listKey => {
  if (listKey === 'Other') {
    return {
      gqlNames: {
        outputTypeName: 'Other',
        createInputName: 'createOther',
        whereInputName: 'OtherWhereInput',
        relateToOneInputName: 'OtherRelateToOneInput',
        whereUniqueInputName: 'OtherWhereUniqueInput',
      },
      access: {
        read: true,
      },
    };
  }
};

const listExtras = (getAuth = () => true, queryMethod = undefined) => ({
  getListByKey,
  adapter: new MockAdapter(),
  getAuth,
  defaultAccess: { list: true, field: true },
  getGraphQLQuery: () => queryMethod,
});

const setup = (extraConfig, getAuth, queryMethod) => {
  const list = new List('Test', { ...config, ...extraConfig }, listExtras(getAuth, queryMethod));
  list.initFields();
  return list;
};

describe('new List()', () => {
  test('new List() - Smoke test', () => {
    const list = setup();
    expect(list).not.toBeNull();
    expect(list.key).toEqual('Test');
    expect(list.getListByKey).toBe(getListByKey);
    expect(list.defaultAccess).toEqual({ list: true, field: true });
    expect(list.getAuth).toBeInstanceOf(Function);
  });

  test('new List() - Plural throws error', () => {
    expect(() => new List('Tests', config, listExtras())).toThrow(Error);
  });

  test('new List() - config', () => {
    const list = setup();
    expect(list.labelResolver).toBeInstanceOf(Function);
    expect(list.fields).toBeInstanceOf(Object);
    expect(list.adminConfig).toEqual({
      defaultColumns: 'name,email',
      defaultPageSize: 50,
      defaultSort: 'name',
      maximumPageSize: 1000,
    });
  });

  test('new List() - labels', () => {
    const list = setup();
    expect(list.adminUILabels).toEqual({
      label: 'Tests',
      singular: 'Test',
      plural: 'Tests',
      path: 'tests',
    });
  });

  test('new List() - gqlNames', () => {
    const list = setup();
    expect(list.gqlNames).toEqual({
      outputTypeName: 'Test',
      itemQueryName: 'Test',
      listQueryName: 'allTests',
      listQueryMetaName: '_allTestsMeta',
      listMetaName: '_TestsMeta',
      authenticatedQueryName: 'authenticatedTest',
      deleteMutationName: 'deleteTest',
      deleteManyMutationName: 'deleteTests',
      updateMutationName: 'updateTest',
      createMutationName: 'createTest',
      updateManyMutationName: 'updateTests',
      createManyMutationName: 'createTests',
      whereInputName: 'TestWhereInput',
      whereUniqueInputName: 'TestWhereUniqueInput',
      updateInputName: 'TestUpdateInput',
      createInputName: 'TestCreateInput',
      updateManyInputName: 'TestsUpdateInput',
      createManyInputName: 'TestsCreateInput',
      relateToManyInputName: 'TestRelateToManyInput',
      relateToOneInputName: 'TestRelateToOneInput',
    });
  });

  test('new List() - access', () => {
    const list = setup();
    expect(list.access).toEqual({
      create: true,
      delete: true,
      read: true,
      update: true,
    });
  });

  test('new List() - fields', () => {
    const list = setup();
    expect(list.fields).toHaveLength(5);
    expect(list.fields[0]).toBeInstanceOf(Text.implementation);
    expect(list.fields[1]).toBeInstanceOf(Text.implementation);
    expect(list.fields[2]).toBeInstanceOf(Relationship.implementation);
    expect(list.fields[3]).toBeInstanceOf(Text.implementation);
    expect(list.fields[4]).toBeInstanceOf(Text.implementation);

    expect(list.fieldsByPath['name']).toBeInstanceOf(Text.implementation);
    expect(list.fieldsByPath['email']).toBeInstanceOf(Text.implementation);
    expect(list.fieldsByPath['other']).toBeInstanceOf(Relationship.implementation);
    expect(list.fieldsByPath['hidden']).toBeInstanceOf(Text.implementation);
    expect(list.fieldsByPath['writeOnce']).toBeInstanceOf(Text.implementation);

    const noFieldsList = new List('NoField', { fields: {} }, listExtras());
    noFieldsList.initFields();
    expect(noFieldsList.fields).toHaveLength(0);
  });

  test('new List() - views', () => {
    const list = setup();
    expect(list.views).toEqual({
      name: {
        Controller: resolveViewPath('Text/views/Controller'),
        Field: resolveViewPath('Text/views/Field'),
        Filter: resolveViewPath('Text/views/Filter'),
      },
      email: {
        Controller: resolveViewPath('Text/views/Controller'),
        Field: resolveViewPath('Text/views/Field'),
        Filter: resolveViewPath('Text/views/Filter'),
      },
      other: {
        Controller: resolveViewPath('Relationship/views/Controller'),
        Field: resolveViewPath('Relationship/views/Field'),
        Filter: resolveViewPath('Relationship/views/Filter'),
        Cell: resolveViewPath('Relationship/views/Cell'),
      },
      hidden: {
        Controller: resolveViewPath('Text/views/Controller'),
        Field: resolveViewPath('Text/views/Field'),
        Filter: resolveViewPath('Text/views/Filter'),
      },
      writeOnce: {
        Controller: resolveViewPath('Text/views/Controller'),
        Field: resolveViewPath('Text/views/Field'),
        Filter: resolveViewPath('Text/views/Filter'),
      },
    });
  });

  test('new List() - adapter', () => {
    const list = setup();
    expect(list.adapter).toBeInstanceOf(MockListAdapter);
  });
});

test('labelResolver', () => {
  // Default: Use name
  const list = setup();
  expect(list.labelResolver({ name: 'a', email: 'a@example.com', id: '1' })).toEqual('a');

  // Use config.labelField if supplied
  const list2 = new List(
    'List2',
    {
      fields: {
        name: { type: Text },
        email: { type: Text },
      },
      labelField: 'email',
    },
    listExtras()
  );
  expect(list2.labelResolver({ name: 'a', email: 'a@example.com', id: '2' })).toEqual(
    'a@example.com'
  );

  // Use labelResolver if supplied (over-rides labelField)
  const list3 = new List(
    'List3',
    {
      fields: {
        name: { type: Text },
        email: { type: Text },
      },
      labelField: 'email',
      labelResolver: item => `${item.name} - ${item.email}`,
    },
    listExtras()
  );
  expect(list3.labelResolver({ name: 'a', email: 'a@example.com', id: '3' })).toEqual(
    'a - a@example.com'
  );

  // Fall back to id if no name or label resolvers available
  const list4 = new List(
    'List4',
    {
      fields: {
        email: { type: Text },
      },
    },
    listExtras()
  );
  expect(list4.labelResolver({ email: 'a@example.com', id: '4' })).toEqual('4');
});

describe('getAdminMeta()', () => {
  test('adminMeta() - Smoke test', () => {
    const list = setup();
    const adminMeta = list.getAdminMeta();
    expect(adminMeta).not.toBeNull();
  });

  test('getAdminMeta() - labels', () => {
    const list = setup();
    const adminMeta = list.getAdminMeta();

    expect(adminMeta.key).toEqual('Test');
    expect(adminMeta.access).toEqual({
      create: true,
      delete: true,
      read: true,
      update: true,
    });
    expect(adminMeta.label).toEqual('Tests');
    expect(adminMeta.singular).toEqual('Test');
    expect(adminMeta.plural).toEqual('Tests');
    expect(adminMeta.path).toEqual('tests');
    expect(adminMeta.gqlNames).toEqual({
      outputTypeName: 'Test',
      itemQueryName: 'Test',
      listQueryName: 'allTests',
      listQueryMetaName: '_allTestsMeta',
      listMetaName: '_TestsMeta',
      authenticatedQueryName: 'authenticatedTest',
      deleteMutationName: 'deleteTest',
      deleteManyMutationName: 'deleteTests',
      updateMutationName: 'updateTest',
      createMutationName: 'createTest',
      updateManyMutationName: 'updateTests',
      createManyMutationName: 'createTests',
      whereInputName: 'TestWhereInput',
      whereUniqueInputName: 'TestWhereUniqueInput',
      updateInputName: 'TestUpdateInput',
      createInputName: 'TestCreateInput',
      updateManyInputName: 'TestsUpdateInput',
      createManyInputName: 'TestsCreateInput',
      relateToManyInputName: 'TestRelateToManyInput',
      relateToOneInputName: 'TestRelateToOneInput',
    });
    expect(adminMeta.adminConfig).toEqual({
      defaultColumns: 'name,email',
      defaultPageSize: 50,
      defaultSort: 'name',
      maximumPageSize: 1000,
    });
  });

  test('getAdminMeta() - fields', () => {
    const list = setup();
    const adminMeta = list.getAdminMeta();

    expect(adminMeta.fields).toHaveLength(4);
    expect(adminMeta.fields[0].path).toEqual('name');
    expect(adminMeta.fields[1].path).toEqual('email');
    expect(adminMeta.fields[2].path).toEqual('other');
    expect(adminMeta.fields[3].path).toEqual('writeOnce');
  });

  test('getAdminMeta() - views', () => {
    const list = setup();
    const adminMeta = list.getAdminMeta();

    expect(adminMeta.views).toEqual({
      name: {
        Controller: resolveViewPath('Text/views/Controller'),
        Field: resolveViewPath('Text/views/Field'),
        Filter: resolveViewPath('Text/views/Filter'),
      },
      email: {
        Controller: resolveViewPath('Text/views/Controller'),
        Field: resolveViewPath('Text/views/Field'),
        Filter: resolveViewPath('Text/views/Filter'),
      },
      other: {
        Controller: resolveViewPath('Relationship/views/Controller'),
        Field: resolveViewPath('Relationship/views/Field'),
        Filter: resolveViewPath('Relationship/views/Filter'),
        Cell: resolveViewPath('Relationship/views/Cell'),
      },
      hidden: {
        Controller: resolveViewPath('Text/views/Controller'),
        Field: resolveViewPath('Text/views/Field'),
        Filter: resolveViewPath('Text/views/Filter'),
      },
      writeOnce: {
        Controller: resolveViewPath('Text/views/Controller'),
        Field: resolveViewPath('Text/views/Field'),
        Filter: resolveViewPath('Text/views/Filter'),
      },
    });
  });
});

test('getGqlTypes()', () => {
  const otherInput = `input OtherRelateToOneInput {
    create: createOther
    connect: OtherWhereUniqueInput
    disconnect: OtherWhereUniqueInput
    disconnectAll: Boolean
  }`;
  const type = `""" A keystone list """
  type Test {
    id: ID
    """
    This virtual field will be resolved in one of the following ways (in this order):
     1. Execution of 'labelResolver' set on the Test List config, or
     2. As an alias to the field set on 'labelField' in the Test List config, or
     3. As an alias to a 'name' field on the Test List (if one exists), or
     4. As an alias to the 'id' field on the Test List.
    """
    _label_: String
    name: String
    email: String
    other: Other
    writeOnce: String
  }`;
  const whereInput = `input TestWhereInput {
    id: ID
    id_not: ID
    id_in: [ID!]
    id_not_in: [ID!]
    AND: [TestWhereInput]
    OR: [TestWhereInput]
    name: String
    name_not: String
    name_contains: String
    name_not_contains: String
    name_starts_with: String
    name_not_starts_with: String
    name_ends_with: String
    name_not_ends_with: String
    name_i: String
    name_not_i: String
    name_contains_i: String
    name_not_contains_i: String
    name_starts_with_i: String
    name_not_starts_with_i: String
    name_ends_with_i: String
    name_not_ends_with_i: String
    name_in: [String]
    name_not_in: [String]
    email: String
    email_not: String
    email_contains: String
    email_not_contains: String
    email_starts_with: String
    email_not_starts_with: String
    email_ends_with: String
    email_not_ends_with: String
    email_i: String
    email_not_i: String
    email_contains_i: String
    email_not_contains_i: String
    email_starts_with_i: String
    email_not_starts_with_i: String
    email_ends_with_i: String
    email_not_ends_with_i: String
    email_in: [String]
    email_not_in: [String]
    other: OtherWhereInput
    other_is_null: Boolean
    writeOnce: String
    writeOnce_not: String
    writeOnce_contains: String
    writeOnce_not_contains: String
    writeOnce_starts_with: String
    writeOnce_not_starts_with: String
    writeOnce_ends_with: String
    writeOnce_not_ends_with: String
    writeOnce_i: String
    writeOnce_not_i: String
    writeOnce_contains_i: String
    writeOnce_not_contains_i: String
    writeOnce_starts_with_i: String
    writeOnce_not_starts_with_i: String
    writeOnce_ends_with_i: String
    writeOnce_not_ends_with_i: String
    writeOnce_in: [String]
    writeOnce_not_in: [String]
  }`;
  const whereUniqueInput = `input TestWhereUniqueInput {
    id: ID!
  }`;
  const updateInput = `input TestUpdateInput {
    name: String
    email: String
    other: OtherRelateToOneInput
    hidden: String
  }`;
  const updateManyInput = `input TestsUpdateInput {
    id: ID!
    data: TestUpdateInput
  }`;
  const createInput = `input TestCreateInput {
    name: String
    email: String
    other: OtherRelateToOneInput
    hidden: String
    writeOnce: String
  }`;
  const createManyInput = `input TestsCreateInput {
    data: TestCreateInput
  }`;

  expect(
    setup({ access: true })
      .getGqlTypes()
      .map(s => print(gql(s)))
  ).toEqual(
    [
      otherInput,
      type,
      whereInput,
      whereUniqueInput,
      updateInput,
      updateManyInput,
      createInput,
      createManyInput,
    ].map(s => print(gql(s)))
  );

  expect(
    setup({ access: false })
      .getGqlTypes()
      .map(s => print(gql(s)))
  ).toEqual([].map(s => print(gql(s))));

  expect(
    setup({ access: { read: true, create: false, update: false, delete: false } })
      .getGqlTypes()
      .map(s => print(gql(s)))
  ).toEqual([otherInput, type, whereInput, whereUniqueInput].map(s => print(gql(s))));

  expect(
    setup({ access: { read: false, create: true, update: false, delete: false } })
      .getGqlTypes()
      .map(s => print(gql(s)))
  ).toEqual(
    [otherInput, type, whereInput, whereUniqueInput, createInput, createManyInput].map(s =>
      print(gql(s))
    )
  );
  expect(
    setup({ access: { read: false, create: false, update: true, delete: false } })
      .getGqlTypes()
      .map(s => print(gql(s)))
  ).toEqual(
    [otherInput, type, whereInput, whereUniqueInput, updateInput, updateManyInput].map(s =>
      print(gql(s))
    )
  );
  expect(
    setup({ access: { read: false, create: false, update: false, delete: true } })
      .getGqlTypes()
      .map(s => print(gql(s)))
  ).toEqual([otherInput, type, whereInput, whereUniqueInput].map(s => print(gql(s))));
});

test('getGraphqlFilterFragment', () => {
  const list = setup();
  expect(list.getGraphqlFilterFragment()).toEqual([
    'where: TestWhereInput',
    'search: String',
    'orderBy: String',
    'first: Int',
    'skip: Int',
  ]);
});

test('getGqlQueries()', () => {
  expect(
    setup({ access: true })
      .getGqlQueries()
      .map(normalise)
  ).toEqual(
    [
      `""" Search for all Test items which match the where clause. """
      allTests(
      where: TestWhereInput
      search: String
      orderBy: String
      first: Int
      skip: Int
    ): [Test]`,
      `""" Search for the Test item with the matching ID. """
      Test(
      where: TestWhereUniqueInput!
    ): Test`,
      `""" Perform a meta-query on all Test items which match the where clause. """
      _allTestsMeta(
      where: TestWhereInput
      search: String
      orderBy: String
      first: Int
      skip: Int
    ): _QueryMeta`,
      `""" Retrieve the meta-data for the Test list. """
      _TestsMeta: _ListMeta`,
      `authenticatedTest: Test`,
    ].map(normalise)
  );

  expect(
    setup({ access: false })
      .getGqlQueries()
      .map(normalise)
  ).toEqual([`authenticatedTest: Test`].map(normalise));

  expect(
    setup({ access: true }, () => false)
      .getGqlQueries()
      .map(normalise)
  ).toEqual(
    [
      `""" Search for all Test items which match the where clause. """
      allTests(
      where: TestWhereInput
      search: String
      orderBy: String
      first: Int
      skip: Int
    ): [Test]`,
      `""" Search for the Test item with the matching ID. """
      Test(
      where: TestWhereUniqueInput!
    ): Test`,
      `""" Perform a meta-query on all Test items which match the where clause. """
      _allTestsMeta(
      where: TestWhereInput
      search: String
      orderBy: String
      first: Int
      skip: Int
    ): _QueryMeta`,
      `""" Retrieve the meta-data for the Test list. """
      _TestsMeta: _ListMeta`,
    ].map(normalise)
  );

  expect(
    setup({ access: false }, () => false)
      .getGqlQueries()
      .map(normalise)
  ).toEqual([].map(normalise));
});

test('getFieldsRelatedTo', () => {
  const list = setup();
  expect(list.getFieldsRelatedTo('Other')).toEqual([list.fieldsByPath['other']]);
  expect(list.getFieldsRelatedTo('Missing')).toEqual([]);
});

test('_throwAccessDenied', () => {
  const list = setup();
  expect(() => list._throwAccessDenied('read', context, 'Test')).toThrow(AccessDeniedError);

  let thrownError;
  try {
    list._throwAccessDenied('update', context, 'Test');
  } catch (error) {
    thrownError = error;
  }
  expect(thrownError.data).toEqual({ target: 'Test', type: 'mutation' });
  expect(thrownError.internalData).toEqual({ authedId: 1, authedListKey: 'Test' });

  try {
    list._throwAccessDenied('delete', context, 'Test', { extraInternal: 2 }, { extraData: 1 });
  } catch (error) {
    thrownError = error;
  }
  expect(thrownError.data).toEqual({ target: 'Test', type: 'mutation', extraData: 1 });
  expect(thrownError.internalData).toEqual({
    authedId: 1,
    authedListKey: 'Test',
    extraInternal: 2,
  });
});

test('wrapFieldResolverWithAC', () => {
  const resolver = () => 'result';
  const list = setup();
  const newResolver = list.wrapFieldResolverWithAC(list.fieldsByPath['name'], resolver);
  expect(newResolver({}, {}, context)).toEqual('result');
  expect(() => newResolver({ makeFalse: true }, {}, context)).toThrow(AccessDeniedError);
});

test('gqlFieldResolvers', () => {
  const resolvers = setup().gqlFieldResolvers;
  expect(resolvers.Test._label_).toBeInstanceOf(Function);
  expect(resolvers.Test.email).toBeInstanceOf(Function);
  expect(resolvers.Test.name).toBeInstanceOf(Function);
  expect(resolvers.Test.other).toBeInstanceOf(Function);
  expect(resolvers.Test.writeOnce).toBeInstanceOf(Function);
  expect(resolvers.Test.hidden).toBe(undefined);

  expect(setup({ access: false }).gqlFieldResolvers).toEqual({});
});

test('gqlAuxFieldResolvers', () => {
  const list = setup();
  expect(list.gqlAuxFieldResolvers).toEqual({});
});

test('gqlAuxQueryResolvers', () => {
  const list = setup();
  expect(list.gqlAuxQueryResolvers).toEqual({});
});

test('gqlAuxMutationResolvers', () => {
  const resolver = id => `Hello, ${id}`;
  const mutations = [
    {
      schema: 'example(id: ID): String',
      resolver,
    },
  ];
  const list = setup({ mutations });
  expect(list.gqlAuxMutationResolvers.example).toBeInstanceOf(Function);
});

test('getGqlMutations()', () => {
  const resolver = id => `Hello, ${id}`;
  const mutations = [
    {
      schema: 'example(id: ID): String',
      resolver,
    },
  ];
  const extraConfig = { mutations };
  expect(
    setup({ access: true, ...extraConfig })
      .getGqlMutations()
      .map(normalise)
  ).toEqual(
    [
      `example(id: ID): String`,
      `""" Create a single Test item. """ createTest(data: TestCreateInput): Test`,
      `""" Create multiple Test items. """ createTests(data: [TestsCreateInput]): [Test]`,
      `""" Update a single Test item by ID. """ updateTest(id: ID! data: TestUpdateInput): Test`,
      `""" Update multiple Test items by ID. """ updateTests(data: [TestsUpdateInput]): [Test]`,
      `""" Delete a single Test item by ID. """ deleteTest(id: ID!): Test`,
      `""" Delete multiple Test items by ID. """ deleteTests(ids: [ID!]): [Test]`,
    ].map(normalise)
  );

  expect(
    setup({ access: false, ...extraConfig })
      .getGqlMutations()
      .map(normalise)
  ).toEqual([`example(id: ID): String`].map(normalise));

  expect(
    setup({ access: { read: true, create: false, update: false, delete: false }, ...extraConfig })
      .getGqlMutations()
      .map(normalise)
  ).toEqual([`example(id: ID): String`].map(normalise));
  expect(
    setup({ access: { read: false, create: true, update: false, delete: false }, ...extraConfig })
      .getGqlMutations()
      .map(normalise)
  ).toEqual(
    [
      `example(id: ID): String`,
      `""" Create a single Test item. """ createTest(data: TestCreateInput): Test`,
      `""" Create multiple Test items. """ createTests(data: [TestsCreateInput]): [Test]`,
    ].map(normalise)
  );
  expect(
    setup({ access: { read: false, create: false, update: true, delete: false }, ...extraConfig })
      .getGqlMutations()
      .map(normalise)
  ).toEqual(
    [
      `example(id: ID): String`,
      `""" Update a single Test item by ID. """ updateTest(id: ID! data: TestUpdateInput): Test`,
      `""" Update multiple Test items by ID. """ updateTests(data: [TestsUpdateInput]): [Test]`,
    ].map(normalise)
  );
  expect(
    setup({ access: { read: false, create: false, update: false, delete: true }, ...extraConfig })
      .getGqlMutations()
      .map(normalise)
  ).toEqual(
    [
      `example(id: ID): String`,
      `""" Delete a single Test item by ID. """ deleteTest(id: ID!): Test`,
      `""" Delete multiple Test items by ID. """ deleteTests(ids: [ID!]): [Test]`,
    ].map(normalise)
  );
});

test('checkFieldAccess', () => {
  const list = setup();
  list.checkFieldAccess(
    'read',
    [{ existingItem: {}, data: { name: 'a', email: 'a@example.com' } }],
    context,
    {
      gqlName: 'testing',
    }
  );
  expect(() =>
    list.checkFieldAccess(
      'read',
      [{ existingItem: { makeFalse: true }, data: { name: 'a', email: 'a@example.com' } }],
      context,
      { gqlName: '' }
    )
  ).toThrow(AccessDeniedError);
  let thrownError;
  try {
    list.checkFieldAccess(
      'read',
      [{ existingItem: { makeFalse: true }, data: { name: 'a', email: 'a@example.com' } }],
      context,
      { gqlName: 'testing', extraData: { extra: 1 } }
    );
  } catch (error) {
    thrownError = error;
  }
  expect(thrownError.data).toEqual({
    restrictedFields: ['name'],
    target: 'testing',
    type: 'query',
  });
  expect(thrownError.internalData).toEqual({
    authedId: 1,
    authedListKey: 'Test',
    extra: 1,
  });
});

test('checkListAccess', () => {
  const list = setup();
  expect(list.checkListAccess(context, 'read', { gqlName: 'testing' })).toEqual(true);

  const newContext = {
    ...context,
    getListAccessControlForUser: (listKey, operation) => operation === 'update',
  };
  expect(list.checkListAccess(newContext, 'update', { gqlName: 'testing' })).toEqual(true);
  expect(() => list.checkListAccess(newContext, 'read', { gqlName: 'testing' })).toThrow(
    AccessDeniedError
  );
});

test('getAccessControlledItem', async () => {
  const list = setup();
  expect(
    await list.getAccessControlledItem(1, true, { context, operation: 'read', gqlName: 'testing' })
  ).toEqual({
    name: 'b',
    email: 'b@example.com',
    index: 1,
  });
  await expect(
    list.getAccessControlledItem(10, true, { context, operation: 'read', gqlName: 'testing' })
  ).rejects.toThrow(AccessDeniedError);

  expect(
    await list.getAccessControlledItem(
      1,
      { id: 1 },
      { context, operation: 'read', gqlName: 'testing' }
    )
  ).toEqual({
    name: 'b',
    email: 'b@example.com',
    index: 1,
  });
  await expect(
    list.getAccessControlledItem(1, { id: 2 }, { context, operation: 'read', gqlName: 'testing' })
  ).rejects.toThrow(AccessDeniedError);

  expect(
    await list.getAccessControlledItem(
      1,
      { id_not: 2 },
      { context, operation: 'read', gqlName: 'testing' }
    )
  ).toEqual({
    name: 'b',
    email: 'b@example.com',
    index: 1,
  });
  await expect(
    list.getAccessControlledItem(
      1,
      { id_not: 1 },
      { context, operation: 'read', gqlName: 'testing' }
    )
  ).rejects.toThrow(AccessDeniedError);

  expect(
    await list.getAccessControlledItem(
      1,
      { id_in: [1, 2] },
      { context, operation: 'read', gqlName: 'testing' }
    )
  ).toEqual({
    name: 'b',
    email: 'b@example.com',
    index: 1,
  });
  await expect(
    list.getAccessControlledItem(
      1,
      { id_in: [2, 3] },
      { context, operation: 'read', gqlName: 'testing' }
    )
  ).rejects.toThrow(AccessDeniedError);

  expect(
    await list.getAccessControlledItem(
      1,
      { id_not_in: [2, 3] },
      { context, operation: 'read', gqlName: 'testing' }
    )
  ).toEqual({
    name: 'b',
    email: 'b@example.com',
    index: 1,
  });
  await expect(
    list.getAccessControlledItem(
      1,
      { id_not_in: [1, 2] },
      { context, operation: 'read', gqlName: 'testing' }
    )
  ).rejects.toThrow(AccessDeniedError);
});

test('getAccessControlledItems', async () => {
  const list = setup();
  expect(await list.getAccessControlledItems([], true)).toEqual([]);
  expect(await list.getAccessControlledItems([1, 2], true)).toEqual([
    { name: 'b', email: 'b@example.com', index: 1 },
    { name: 'c', email: 'c@example.com', index: 2 },
  ]);
  expect(await list.getAccessControlledItems([1, 2, 1, 2], true)).toEqual([
    { name: 'b', email: 'b@example.com', index: 1 },
    { name: 'c', email: 'c@example.com', index: 2 },
  ]);

  expect(await list.getAccessControlledItems([1, 2], { id: 1 })).toEqual([
    { name: 'b', email: 'b@example.com', index: 1 },
  ]);
  expect(await list.getAccessControlledItems([1, 2], { id: 3 })).toEqual([]);

  expect(await list.getAccessControlledItems([1, 2], { id_in: [1, 2, 3] })).toEqual([
    { name: 'b', email: 'b@example.com', index: 1 },
    { name: 'c', email: 'c@example.com', index: 2 },
  ]);
  expect(await list.getAccessControlledItems([1, 2], { id_in: [2, 3] })).toEqual([
    { name: 'c', email: 'c@example.com', index: 2 },
  ]);
  expect(await list.getAccessControlledItems([1, 2], { id_in: [3, 4] })).toEqual([]);

  expect(await list.getAccessControlledItems([1, 2], { id_not: 2 })).toEqual([
    { name: 'b', email: 'b@example.com', index: 1 },
  ]);
  expect(await list.getAccessControlledItems([1, 2], { id_not: 3 })).toEqual([
    { name: 'b', email: 'b@example.com', index: 1 },
    { name: 'c', email: 'c@example.com', index: 2 },
  ]);

  expect(await list.getAccessControlledItems([1, 2], { id_not_in: [1, 2, 3] })).toEqual([]);
  expect(await list.getAccessControlledItems([1, 2], { id_not_in: [2, 3] })).toEqual([
    { name: 'b', email: 'b@example.com', index: 1 },
  ]);
  expect(await list.getAccessControlledItems([1, 2], { id_not_in: [3, 4] })).toEqual([
    { name: 'b', email: 'b@example.com', index: 1 },
    { name: 'c', email: 'c@example.com', index: 2 },
  ]);
});

test('gqlQueryResolvers', () => {
  const resolvers = setup({ access: true }).gqlQueryResolvers;
  expect(resolvers['allTests']).toBeInstanceOf(Function); // listQueryName
  expect(resolvers['_allTestsMeta']).toBeInstanceOf(Function); // listQueryMetaName
  expect(resolvers['_TestsMeta']).toBeInstanceOf(Function); // listMetaName
  expect(resolvers['Test']).toBeInstanceOf(Function); // itemQueryName
  expect(resolvers['authenticatedTest']).toBeInstanceOf(Function); // authenticatedQueryName

  const resolvers2 = setup({ access: false }).gqlQueryResolvers;
  expect(resolvers2['allTests']).toBe(undefined); // listQueryName
  expect(resolvers2['_allTestsMeta']).toBe(undefined); // listQueryMetaName
  expect(resolvers2['_TestsMeta']).toBe(undefined); // listMetaName
  expect(resolvers2['Test']).toBe(undefined); // itemQueryName
  expect(resolvers2['authenticatedTest']).toBeInstanceOf(Function); // authenticatedQueryName

  const resolvers3 = setup({ access: true }, () => false).gqlQueryResolvers;
  expect(resolvers3['allTests']).toBeInstanceOf(Function); // listQueryName
  expect(resolvers3['_allTestsMeta']).toBeInstanceOf(Function); // listQueryMetaName
  expect(resolvers3['_TestsMeta']).toBeInstanceOf(Function); // listMetaName
  expect(resolvers3['Test']).toBeInstanceOf(Function); // itemQueryName
  expect(resolvers3['authenticatedTest']).toBe(undefined); // authenticatedQueryName

  const resolvers4 = setup({ access: false }, () => false).gqlQueryResolvers;
  expect(resolvers4).toEqual({});
});

test('listQuery', async () => {
  const list = setup();
  expect(await list.listQuery({ where: { id: 1 } }, context, 'testing')).toEqual([
    { name: 'b', email: 'b@example.com', index: 1 },
  ]);
});

test('listQueryMeta', async () => {
  const list = setup();
  expect(
    await (await list.listQueryMeta({ where: { id: 1 } }, context, 'testing')).getCount()
  ).toEqual(1);
  expect(
    await (await list.listQueryMeta({ where: { id_in: [1, 2] } }, context, 'testing')).getCount()
  ).toEqual(2);
});

test('listMeta', () => {
  const meta = setup().listMeta(context);
  expect(meta.getAccess).toBeInstanceOf(Function);
  expect(meta.getSchema).toBeInstanceOf(Function);
  expect(meta.name).toEqual('Test');

  const access = meta.getAccess();
  expect(access.getCreate).toBeInstanceOf(Function);
  expect(access.getDelete).toBeInstanceOf(Function);
  expect(access.getRead).toBeInstanceOf(Function);
  expect(access.getUpdate).toBeInstanceOf(Function);

  expect(access.getCreate()).toEqual(true);
  expect(access.getDelete()).toEqual(true);
  expect(access.getRead()).toEqual(true);
  expect(access.getUpdate()).toEqual(true);

  const schema = meta.getSchema();
  expect(schema).toEqual({
    key: 'Test',
    queries: ['Test', 'allTests', '_allTestsMeta', 'authenticatedTest'],
    type: 'Test',
  });

  expect(
    setup({ access: true }, () => false)
      .listMeta(context)
      .getSchema()
  ).toEqual({
    key: 'Test',
    queries: ['Test', 'allTests', '_allTestsMeta'],
    type: 'Test',
  });
});

test('itemQuery', async () => {
  const list = setup();
  expect(await list.itemQuery({ where: { id: 0 } }, context)).toEqual({
    name: 'a',
    email: 'a@example.com',
    index: 0,
  });
  await expect(list.itemQuery({ where: { id: 4 } }, context)).rejects.toThrow(AccessDeniedError);
});

test('authenticatedQuery', async () => {
  const list = setup();
  expect(await list.authenticatedQuery(context)).toEqual({
    name: 'b',
    email: 'b@example.com',
    index: 1,
  });
  expect(await list.authenticatedQuery({ ...context, authedItem: undefined })).toBe(null);
  expect(await list.authenticatedQuery({ ...context, authedListKey: 'Other' })).toBe(null);
});

test('gqlMutationResolvers', () => {
  let resolvers = setup({ access: true }).gqlMutationResolvers;
  expect(resolvers['createTest']).toBeInstanceOf(Function);
  expect(resolvers['updateTest']).toBeInstanceOf(Function);
  expect(resolvers['deleteTest']).toBeInstanceOf(Function);
  expect(resolvers['deleteTests']).toBeInstanceOf(Function);

  resolvers = setup({ access: false }).gqlMutationResolvers;
  expect(resolvers).toEqual({});

  resolvers = setup({ access: { read: true, create: false, update: false, delete: false } })
    .gqlMutationResolvers;
  expect(resolvers).toEqual({});

  resolvers = setup({ access: { read: false, create: true, update: false, delete: false } })
    .gqlMutationResolvers;
  expect(resolvers['createTest']).toBeInstanceOf(Function);
  expect(resolvers['updateTest']).toBe(undefined);
  expect(resolvers['deleteTest']).toBe(undefined);
  expect(resolvers['deleteTests']).toBe(undefined);

  resolvers = setup({ access: { read: false, create: false, update: true, delete: false } })
    .gqlMutationResolvers;
  expect(resolvers['createTest']).toBe(undefined);
  expect(resolvers['updateTest']).toBeInstanceOf(Function);
  expect(resolvers['deleteTest']).toBe(undefined);
  expect(resolvers['deleteTests']).toBe(undefined);

  resolvers = setup({ access: { read: false, create: false, update: false, delete: true } })
    .gqlMutationResolvers;
  expect(resolvers['createTest']).toBe(undefined);
  expect(resolvers['updateTest']).toBe(undefined);
  expect(resolvers['deleteTest']).toBeInstanceOf(Function);
  expect(resolvers['deleteTests']).toBeInstanceOf(Function);
});

test('createMutation', async () => {
  const list = setup();
  const result = await list.createMutation({ name: 'test', email: 'test@example.com' }, context);
  expect(result).toEqual({ name: 'test', email: 'test@example.com', index: 3, other: null });
});

test('createManyMutation', async () => {
  const list = setup();
  const result = await list.createManyMutation(
    [{ name: 'test1', email: 'test1@example.com' }, { name: 'test2', email: 'test2@example.com' }],
    context
  );
  expect(result).toEqual([
    { name: 'test1', email: 'test1@example.com', index: 3, other: null },
    { name: 'test2', email: 'test2@example.com', index: 4, other: null },
  ]);
});

test('updateMutation', async () => {
  const list = setup();
  const result = await list.updateMutation(
    1,
    { name: 'update', email: 'update@example.com' },
    context
  );
  expect(result).toEqual({ name: 'update', email: 'update@example.com', index: 1 });
});

test('updateManyMutation', async () => {
  const list = setup();
  const result = await list.updateManyMutation(
    [
      { id: 1, data: { name: 'update1', email: 'update1@example.com' } },
      { id: 2, data: { email: 'update2@example.com' } },
    ],
    context
  );
  expect(result).toEqual([
    { name: 'update1', email: 'update1@example.com', index: 1 },
    { name: 'c', email: 'update2@example.com', index: 2 },
  ]);
});

test('deleteMutation', async () => {
  const list = setup();
  const result = await list.deleteMutation(1, context);
  expect(result).toBe(undefined);
});

test('deleteManyMutation', async () => {
  const list = setup();
  const result = await list.deleteManyMutation([1, 2], context);
  expect(result).toEqual([undefined, undefined]);
});

test('getFieldByPath', () => {
  const list = setup();
  expect(list.getFieldByPath('name').path).toEqual('name');
  expect(list.getFieldByPath('email').path).toEqual('email');
  expect(list.getFieldByPath('hidden').path).toEqual('hidden');
  expect(list.getFieldByPath('writeOnce').path).toEqual('writeOnce');
  expect(list.getFieldByPath('missing')).toBe(undefined);
});

describe('List Hooks', () => {
  describe('change mutation', () => {
    test('provides the expected list API', () => {
      return Promise.all(
        [
          list => list.createMutation({ name: 'test', email: 'test@example.com' }, context),
          list => list.updateMutation(1, { name: 'update', email: 'update@example.com' }, context),
        ].map(async action => {
          const hooks = {
            resolveInput: jest.fn(({ resolvedData }) => resolvedData),
            validateInput: jest.fn(),
            beforeChange: jest.fn(),
            afterChange: jest.fn(),
          };
          const list = setup({ hooks });
          await action(list);

          Object.keys(hooks).forEach(hook => {
            expect(hooks[hook]).toHaveBeenCalledWith(
              expect.objectContaining({
                actions: {
                  query: expect.any(Function),
                },
              })
            );
          });
        })
      );
    });

    test('can execute a query from within a hook', () => {
      return Promise.all(
        [
          list => list.createMutation({ name: 'test', email: 'test@example.com' }, context),
          list => list.updateMutation(1, { name: 'update', email: 'update@example.com' }, context),
        ].map(async action => {
          const queryMethod = jest.fn(() => ({ data: { hello: 'world' } }));
          const queryString = 'query { /* Fake query string */ }';

          const hooks = {
            beforeChange: jest.fn(async ({ actions: { query } }) => {
              await query(queryString);
            }),
          };

          const list = setup({ hooks }, undefined, queryMethod);
          await action(list);

          expect(queryMethod).toHaveBeenCalledWith(
            queryString,
            // The context object
            expect.any(Object),
            // no variables
            undefined
          );
        })
      );
    });

    test('can execute a query with variables from within a hook', () => {
      return Promise.all(
        [
          list => list.createMutation({ name: 'test', email: 'test@example.com' }, context),
          list => list.updateMutation(1, { name: 'update', email: 'update@example.com' }, context),
        ].map(async action => {
          const queryMethod = jest.fn(() => ({ data: { hello: 'world' } }));
          const queryString = 'query { /* Fake query string */ }';
          const variables = { id: 'abc123' };

          const hooks = {
            beforeChange: jest.fn(async ({ actions: { query } }) => {
              await query(queryString, { variables });
            }),
          };

          const list = setup({ hooks }, undefined, queryMethod);
          await action(list);

          expect(queryMethod).toHaveBeenCalledWith(
            queryString,
            // The context object
            expect.any(Object),
            expect.objectContaining(variables)
          );
        })
      );
    });
  });

  describe('delete mutation', () => {
    test('provides the expected list API', async () => {
      const hooks = {
        validateDelete: jest.fn(),
        beforeDelete: jest.fn(),
        afterDelete: jest.fn(),
      };
      const list = setup({ hooks });
      await list.deleteMutation(1, context);

      Object.keys(hooks).forEach(hook => {
        expect(hooks[hook]).toHaveBeenCalledWith(
          expect.objectContaining({
            actions: {
              query: expect.any(Function),
            },
          })
        );
      });
    });
  });
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
      list.initFields();
      expect(list.fieldsByPath.foo).toBeInstanceOf(keystoneType.implementation);
    });
  });
});
