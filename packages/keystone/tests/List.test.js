const { gql } = require('apollo-server-express');
const { print } = require('graphql/language/printer');

const { List } = require('../lib/ListTypes');
const { AccessDeniedError } = require('../lib/ListTypes/graphqlErrors');
const { Text, Checkbox, Float, Relationship, Integer } = require('@keystone-next/fields-legacy');
const path = require('path');

let fieldsPackagePath = path.dirname(require.resolve('@keystone-next/fields-legacy/package.json'));
function resolveViewPath(viewPath) {
  return path.join(fieldsPackagePath, 'types', viewPath);
}

Text.adapters['mock'] = {};
Checkbox.adapters['mock'] = {};
Float.adapters['mock'] = {};
Relationship.adapters['mock'] = {};

const context = {
  getListAccessControlForUser: () => true,
  getFieldAccessControlForUser: (access, listKey, fieldPath, originalInput, existingItem) =>
    !(existingItem && existingItem.makeFalse && fieldPath === 'name'),
  getAuthAccessControlForUser: () => true,
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
        public: {
          read: true,
        },
      },
    };
  }
};

class MockFieldImplementation {
  constructor() {
    this.access = {
      public: {
        create: false,
        read: true,
        update: false,
        delete: false,
      },
    };
    this.config = {};
    this.hooks = {};
  }
  getAdminMeta() {
    return { path: 'id' };
  }
  gqlOutputFields() {
    return ['id: ID'];
  }
  gqlQueryInputFields() {
    return ['id: ID'];
  }
  gqlUpdateInputFields() {
    return ['id: ID'];
  }
  gqlCreateInputFields() {
    return ['id: ID'];
  }
  getGqlAuxTypes() {
    return [];
  }
  getGqlAuxQueries() {
    return [];
  }
  gqlOutputFieldResolvers() {
    return {};
  }
  gqlAuxQueryResolvers() {
    return {};
  }
  gqlAuxFieldResolvers() {
    return {};
  }
  extendAdminViews(views) {
    return views;
  }
  getDefaultValue() {
    return;
  }
  async resolveInput({ resolvedData }) {
    return resolvedData.id;
  }
  async validateInput() {}
  async beforeChange() {}
  async afterChange() {}
  async beforeDelete() {}
  async validateDelete() {}
  async afterDelete() {}
}
class MockFieldAdapter {
  listAdapter = { name: 'mock' };
}

const MockIdType = {
  implementation: MockFieldImplementation,
  views: {},
  adapters: { mock: MockFieldAdapter },
};

class MockListAdapter {
  name = 'mock';
  constructor(parentAdapter) {
    this.parentAdapter = parentAdapter;
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
  itemsQuery = async ({ where: { id_in: ids, id, id_not_in } }, { meta = false } = {}) => {
    if (meta) {
      return {
        count: (id !== undefined
          ? [this.items[id]]
          : ids.filter(i => !id_not_in || !id_not_in.includes(i)).map(i => this.items[i])
        ).length,
      };
    } else {
      return id !== undefined
        ? [this.items[id]]
        : ids.filter(i => !id_not_in || !id_not_in.includes(i)).map(i => this.items[i]);
    }
  };
  itemsQueryMeta = async args => this.itemsQuery(args, { meta: true });
  update = (id, item) => {
    this.items[id] = { ...this.items[id], ...item };
    return this.items[id];
  };
}

class MockAdapter {
  name = 'mock';
  newListAdapter = () => new MockListAdapter(this);
  getDefaultPrimaryKeyConfig = () => ({ type: MockIdType });
}

const listExtras = () => ({
  getListByKey,
  adapter: new MockAdapter(),
  defaultAccess: { list: true, field: true },
  registerType: () => {},
  schemaNames: ['public'],
});

const setup = extraConfig => {
  const list = new List('Test', { ...config, ...extraConfig }, listExtras());
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
      defaultSort: 'name',
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
      listSortName: 'SortTestsBy',
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
      internal: {
        create: true,
        read: true,
        update: true,
        delete: true,
        auth: true,
      },
      public: {
        create: true,
        delete: true,
        read: true,
        update: true,
        auth: true,
      },
    });
  });

  test('new List() - fields', () => {
    const list = setup();
    expect(list.fields).toHaveLength(6);
    expect(list.fields[0]).toBeInstanceOf(MockIdType.implementation);
    expect(list.fields[1]).toBeInstanceOf(Text.implementation);
    expect(list.fields[2]).toBeInstanceOf(Text.implementation);
    expect(list.fields[3]).toBeInstanceOf(Relationship.implementation);
    expect(list.fields[4]).toBeInstanceOf(Text.implementation);
    expect(list.fields[5]).toBeInstanceOf(Text.implementation);

    expect(list.fieldsByPath['id']).toBeInstanceOf(MockIdType.implementation);
    expect(list.fieldsByPath['name']).toBeInstanceOf(Text.implementation);
    expect(list.fieldsByPath['email']).toBeInstanceOf(Text.implementation);
    expect(list.fieldsByPath['other']).toBeInstanceOf(Relationship.implementation);
    expect(list.fieldsByPath['hidden']).toBeInstanceOf(Text.implementation);
    expect(list.fieldsByPath['writeOnce']).toBeInstanceOf(Text.implementation);

    const idOnlyList = new List('NoField', { fields: {} }, listExtras());
    idOnlyList.initFields();
    expect(idOnlyList.fields).toHaveLength(1);
    expect(list.fields[0]).toBeInstanceOf(MockIdType.implementation);
    expect(list.fieldsByPath['id']).toBeInstanceOf(MockIdType.implementation);
  });

  test('new List() - views', () => {
    const list = setup();
    expect(list.views).toEqual({
      id: {},
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

  // Use Integer as a labelField
  const list21 = new List(
    'List21',
    {
      fields: {
        index: { type: Integer },
        name: { type: Text },
      },
      labelField: 'index',
    },
    listExtras()
  );
  expect(list21.labelResolver({ name: 'Test integer', index: 0, id: '21' })).toEqual('0');

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
    const schemaName = 'public';
    const adminMeta = list.getAdminMeta({ schemaName });
    expect(adminMeta).not.toBeNull();
  });

  test('getAdminMeta() - labels', () => {
    const list = setup();
    const schemaName = 'public';
    const adminMeta = list.getAdminMeta({ schemaName });

    expect(adminMeta.key).toEqual('Test');
    expect(adminMeta.access).toEqual({
      create: true,
      delete: true,
      read: true,
      update: true,
      auth: true,
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
      listSortName: 'SortTestsBy',
      listMetaName: '_TestsMeta',
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
      defaultSort: 'name',
    });
  });

  test('getAdminMeta() - fields', () => {
    const list = setup();
    const schemaName = 'public';
    const adminMeta = list.getAdminMeta({ schemaName });

    expect(adminMeta.fields).toHaveLength(5);
    expect(adminMeta.fields[0].path).toEqual('id');
    expect(adminMeta.fields[1].path).toEqual('name');
    expect(adminMeta.fields[2].path).toEqual('email');
    expect(adminMeta.fields[3].path).toEqual('other');
    expect(adminMeta.fields[4].path).toEqual('writeOnce');
  });
});

describe(`getGqlTypes()`, () => {
  const type = `""" A keystone list """
      type Test {
        """
        This virtual field will be resolved in one of the following ways (in this order):
        1. Execution of 'labelResolver' set on the Test List config, or
        2. As an alias to the field set on 'labelField' in the Test List config, or
        3. As an alias to a 'name' field on the Test List (if one exists), or
        4. As an alias to the 'id' field on the Test List.
        """
        _label_: String
        id: ID
        name: String
        email: String
        other: Other
        writeOnce: String
      }`;
  const whereInput = `input TestWhereInput {
        AND: [TestWhereInput]
        OR: [TestWhereInput]
        id: ID
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
  const sortTestsBy = `enum SortTestsBy {
        name_ASC
        name_DESC
        email_ASC
        email_DESC
        other_ASC
        other_DESC
        writeOnce_ASC
        writeOnce_DESC
      }`;
  const otherRelateToOneInput = `input OtherRelateToOneInput {
    connect: OtherWhereUniqueInput
    disconnect: OtherWhereUniqueInput
    disconnectAll: Boolean
  }`;
  const schemaName = 'public';
  test('access: true', () => {
    expect(
      setup({ access: true })
        .getGqlTypes({ schemaName })
        .map(s => print(gql(s)))
    ).toEqual(
      [
        otherRelateToOneInput,
        type,
        whereInput,
        whereUniqueInput,
        sortTestsBy,
        updateInput,
        updateManyInput,
        createInput,
        createManyInput,
      ].map(s => print(gql(s)))
    );
  });
  test('access: false', () => {
    expect(
      setup({ access: false })
        .getGqlTypes({ schemaName })
        .map(s => print(gql(s)))
    ).toEqual([]);
  });
  test('read: true', () => {
    expect(
      setup({ access: { read: true, create: false, update: false, delete: false } })
        .getGqlTypes({ schemaName })
        .map(s => print(gql(s)))
    ).toEqual(
      [otherRelateToOneInput, type, whereInput, whereUniqueInput, sortTestsBy].map(s =>
        print(gql(s))
      )
    );
  });
  test('create: true', () => {
    expect(
      setup({ access: { read: false, create: true, update: false, delete: false } })
        .getGqlTypes({ schemaName })
        .map(s => print(gql(s)))
    ).toEqual(
      [
        otherRelateToOneInput,
        type,
        whereInput,
        whereUniqueInput,
        sortTestsBy,
        createInput,
        createManyInput,
      ].map(s => print(gql(s)))
    );
  });
  test('update: true', () => {
    expect(
      setup({ access: { read: false, create: false, update: true, delete: false } })
        .getGqlTypes({ schemaName })
        .map(s => print(gql(s)))
    ).toEqual(
      [
        otherRelateToOneInput,
        type,
        whereInput,
        whereUniqueInput,
        sortTestsBy,
        updateInput,
        updateManyInput,
      ].map(s => print(gql(s)))
    );
  });
  test('delete: true', () => {
    expect(
      setup({ access: { read: false, create: false, update: false, delete: true } })
        .getGqlTypes({ schemaName })
        .map(s => print(gql(s)))
    ).toEqual(
      [otherRelateToOneInput, type, whereInput, whereUniqueInput, sortTestsBy].map(s =>
        print(gql(s))
      )
    );
  });
});

test('getGraphqlFilterFragment', () => {
  const list = setup();
  expect(list.getGraphqlFilterFragment()).toEqual([
    'where: TestWhereInput',
    'search: String',
    'sortBy: [SortTestsBy!]',
    'orderBy: String',
    'first: Int',
    'skip: Int',
  ]);
});

describe(`getGqlQueries()`, () => {
  const schemaName = 'public';
  test('access: true', () => {
    expect(setup({ access: true }).getGqlQueries({ schemaName }).map(normalise)).toEqual(
      [
        `""" Search for all Test items which match the where clause. """
          allTests(
          where: TestWhereInput
          search: String
          sortBy: [SortTestsBy!]
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
          sortBy: [SortTestsBy!]
          orderBy: String
          first: Int
          skip: Int
        ): _QueryMeta`,
        `""" Retrieve the meta-data for the Test list. """
        _TestsMeta: _ListMeta`,
      ].map(normalise)
    );
  });
  test('access: false', () => {
    expect(setup({ access: false }).getGqlQueries({ schemaName }).map(normalise)).toEqual([]);
  });
});

test('_wrapFieldResolverWith', async () => {
  const resolver = () => 'result';
  const list = setup();
  const newResolver = list._wrapFieldResolver(list.fieldsByPath['name'], resolver);
  await expect(newResolver({}, {}, context)).resolves.toEqual('result');
  await expect(newResolver({ makeFalse: true }, {}, context)).rejects.toThrow(AccessDeniedError);
});

test('gqlFieldResolvers', () => {
  const schemaName = 'public';
  const resolvers = setup().gqlFieldResolvers({ schemaName });
  expect(resolvers.Test._label_).toBeInstanceOf(Function);
  expect(resolvers.Test.email).toBeInstanceOf(Function);
  expect(resolvers.Test.name).toBeInstanceOf(Function);
  expect(resolvers.Test.other).toBeInstanceOf(Function);
  expect(resolvers.Test.writeOnce).toBeInstanceOf(Function);
  expect(resolvers.Test.hidden).toBe(undefined);

  expect(setup({ access: false }).gqlFieldResolvers({ schemaName })).toEqual({});
});

test('gqlAuxFieldResolvers', () => {
  const list = setup();
  const schemaName = 'public';
  expect(list.gqlAuxFieldResolvers({ schemaName })).toEqual({});
});

test('gqlAuxQueryResolvers', () => {
  const list = setup();
  expect(list.gqlAuxQueryResolvers()).toEqual({});
});

describe(`getGqlMutations()`, () => {
  const extraConfig = {};
  const schemaName = 'public';
  test('access: true', () => {
    expect(
      setup({ access: true, ...extraConfig })
        .getGqlMutations({ schemaName })
        .map(normalise)
    ).toEqual(
      [
        `""" Create a single Test item. """ createTest(data: TestCreateInput): Test`,
        `""" Create multiple Test items. """ createTests(data: [TestsCreateInput]): [Test]`,
        `""" Update a single Test item by ID. """ updateTest(id: ID! data: TestUpdateInput): Test`,
        `""" Update multiple Test items by ID. """ updateTests(data: [TestsUpdateInput]): [Test]`,
        `""" Delete a single Test item by ID. """ deleteTest(id: ID!): Test`,
        `""" Delete multiple Test items by ID. """ deleteTests(ids: [ID!]): [Test]`,
      ].map(normalise)
    );
  });
  test('access: false', () => {
    expect(
      setup({ access: false, ...extraConfig })
        .getGqlMutations({ schemaName })
        .map(normalise)
    ).toEqual([]);
  });
  test('read: true', () => {
    expect(
      setup({
        access: { read: true, create: false, update: false, delete: false },
        ...extraConfig,
      })
        .getGqlMutations({ schemaName })
        .map(normalise)
    ).toEqual([].map(normalise));
  });
  test('create: true', () => {
    expect(
      setup({
        access: { read: false, create: true, update: false, delete: false },
        ...extraConfig,
      })
        .getGqlMutations({ schemaName })
        .map(normalise)
    ).toEqual(
      [
        `""" Create a single Test item. """ createTest(data: TestCreateInput): Test`,
        `""" Create multiple Test items. """ createTests(data: [TestsCreateInput]): [Test]`,
      ].map(normalise)
    );
  });
  test('update: true', () => {
    expect(
      setup({
        access: { read: false, create: false, update: true, delete: false },
        ...extraConfig,
      })
        .getGqlMutations({ schemaName })
        .map(normalise)
    ).toEqual(
      [
        `""" Update a single Test item by ID. """ updateTest(id: ID! data: TestUpdateInput): Test`,
        `""" Update multiple Test items by ID. """ updateTests(data: [TestsUpdateInput]): [Test]`,
      ].map(normalise)
    );
  });
  test('delete: true', () => {
    expect(
      setup({
        access: { read: false, create: false, update: false, delete: true },
        ...extraConfig,
      })
        .getGqlMutations({ schemaName })
        .map(normalise)
    ).toEqual(
      [
        `""" Delete a single Test item by ID. """ deleteTest(id: ID!): Test`,
        `""" Delete multiple Test items by ID. """ deleteTests(ids: [ID!]): [Test]`,
      ].map(normalise)
    );
  });
});

test('checkFieldAccess', async () => {
  const list = setup();
  list.checkFieldAccess(
    'read',
    [{ existingItem: {}, data: { name: 'a', email: 'a@example.com' } }],
    context,
    {
      gqlName: 'testing',
    }
  );
  await expect(
    list.checkFieldAccess(
      'read',
      [{ existingItem: { makeFalse: true }, data: { name: 'a', email: 'a@example.com' } }],
      context,
      { gqlName: '' }
    )
  ).rejects.toThrow(AccessDeniedError);
  let thrownError;
  try {
    await list.checkFieldAccess(
      'read',
      [{ existingItem: { makeFalse: true }, data: { name: 'a', email: 'a@example.com' } }],
      context,
      { gqlName: 'testing', extra: 1 }
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

test('checkListAccess', async () => {
  const list = setup();
  const originalInput = {};
  await expect(
    list.checkListAccess(context, originalInput, 'read', { gqlName: 'testing' })
  ).resolves.toEqual(true);

  const newContext = {
    ...context,
    getListAccessControlForUser: (access, listKey, originalInput, operation) =>
      operation === 'update',
  };
  await expect(
    list.checkListAccess(newContext, originalInput, 'update', { gqlName: 'testing' })
  ).resolves.toEqual(true);
  await expect(
    list.checkListAccess(newContext, originalInput, 'read', { gqlName: 'testing' })
  ).rejects.toThrow(AccessDeniedError);
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

test(`gqlQueryResolvers`, () => {
  const schemaName = 'public';
  const resolvers = setup({ access: true }).gqlQueryResolvers({ schemaName });
  expect(resolvers['allTests']).toBeInstanceOf(Function); // listQueryName
  expect(resolvers['_allTestsMeta']).toBeInstanceOf(Function); // listQueryMetaName
  expect(resolvers['_TestsMeta']).toBeInstanceOf(Function); // listMetaName
  expect(resolvers['Test']).toBeInstanceOf(Function); // itemQueryName

  const resolvers2 = setup({ access: false }).gqlQueryResolvers({ schemaName });
  expect(resolvers2['allTests']).toBe(undefined); // listQueryName
  expect(resolvers2['_allTestsMeta']).toBe(undefined); // listQueryMetaName
  expect(resolvers2['_TestsMeta']).toBe(undefined); // listMetaName
  expect(resolvers2['Test']).toBe(undefined); // itemQueryName
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

test(`listMeta`, () => {
  const meta = setup({}).listMeta(context);
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
    queries: {
      item: 'Test',
      list: 'allTests',
      meta: '_allTestsMeta',
    },
    mutations: {
      create: 'createTest',
      createMany: 'createTests',
      update: 'updateTest',
      updateMany: 'updateTests',
      delete: 'deleteTest',
      deleteMany: 'deleteTests',
    },
    inputTypes: {
      whereInput: 'TestWhereInput',
      whereUniqueInput: 'TestWhereUniqueInput',
      createInput: 'TestCreateInput',
      createManyInput: 'TestsCreateInput',
      updateInput: 'TestUpdateInput',
      updateManyInput: 'TestsUpdateInput',
    },
    type: 'Test',
  });

  expect(
    setup({ access: true }, () => false)
      .listMeta(context)
      .getSchema()
  ).toEqual({
    key: 'Test',
    queries: {
      item: 'Test',
      list: 'allTests',
      meta: '_allTestsMeta',
    },
    mutations: {
      create: 'createTest',
      createMany: 'createTests',
      update: 'updateTest',
      updateMany: 'updateTests',
      delete: 'deleteTest',
      deleteMany: 'deleteTests',
    },
    inputTypes: {
      whereInput: 'TestWhereInput',
      whereUniqueInput: 'TestWhereUniqueInput',
      createInput: 'TestCreateInput',
      createManyInput: 'TestsCreateInput',
      updateInput: 'TestUpdateInput',
      updateManyInput: 'TestsUpdateInput',
    },
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

describe(`gqlMutationResolvers`, () => {
  const schemaName = 'public';
  let resolvers;
  test('access: true', () => {
    resolvers = setup({ access: true }).gqlMutationResolvers({ schemaName });
    expect(resolvers['createTest']).toBeInstanceOf(Function);
    expect(resolvers['updateTest']).toBeInstanceOf(Function);
    expect(resolvers['deleteTest']).toBeInstanceOf(Function);
    expect(resolvers['deleteTests']).toBeInstanceOf(Function);
  });
  test('access: false', () => {
    resolvers = setup({ access: false }).gqlMutationResolvers({ schemaName });
    expect(resolvers['authenticateTestWithPassword']).toBe(undefined);
    expect(resolvers['unauthenticateTest']).toBe(undefined);
    expect(resolvers['updateAuthenticatedTest']).toBe(undefined);
  });
  test('read: true', () => {
    resolvers = setup({
      access: { read: true, create: false, update: false, delete: false },
    }).gqlMutationResolvers({ schemaName });
  });
  test('create: true', () => {
    resolvers = setup({
      access: { read: false, create: true, update: false, delete: false },
    }).gqlMutationResolvers({ schemaName });
    expect(resolvers['createTest']).toBeInstanceOf(Function);
    expect(resolvers['updateTest']).toBe(undefined);
    expect(resolvers['deleteTest']).toBe(undefined);
    expect(resolvers['deleteTests']).toBe(undefined);
  });
  test('update: true', () => {
    resolvers = setup({
      access: { read: false, create: false, update: true, delete: false },
    }).gqlMutationResolvers({ schemaName });
    expect(resolvers['createTest']).toBe(undefined);
    expect(resolvers['updateTest']).toBeInstanceOf(Function);
    expect(resolvers['deleteTest']).toBe(undefined);
    expect(resolvers['deleteTests']).toBe(undefined);
  });
  test('delete: true', () => {
    resolvers = setup({
      access: { read: false, create: false, update: false, delete: true },
    }).gqlMutationResolvers({ schemaName });
    expect(resolvers['createTest']).toBe(undefined);
    expect(resolvers['updateTest']).toBe(undefined);
    expect(resolvers['deleteTest']).toBeInstanceOf(Function);
    expect(resolvers['deleteTests']).toBeInstanceOf(Function);
  });
});

test('createMutation', async () => {
  const list = setup();
  const result = await list.createMutation({ name: 'test', email: 'test@example.com' }, context);
  expect(result).toEqual({ name: 'test', email: 'test@example.com', index: 3 });
});

test('createManyMutation', async () => {
  const list = setup();
  const result = await list.createManyMutation(
    [
      { data: { name: 'test1', email: 'test1@example.com' } },
      { data: { name: 'test2', email: 'test2@example.com' } },
    ],
    context
  );
  expect(result).toEqual([
    { name: 'test1', email: 'test1@example.com', index: 3 },
    { name: 'test2', email: 'test2@example.com', index: 4 },
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
  expect(result).toEqual({ name: 'b', email: 'b@example.com', index: 1 });
});

test('deleteManyMutation', async () => {
  const list = setup();
  const result = await list.deleteManyMutation([1, 2], context);
  expect(result).toEqual([
    { name: 'b', email: 'b@example.com', index: 1 },
    { name: 'c', email: 'c@example.com', index: 2 },
  ]);
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
            expect(hooks[hook]).toHaveBeenCalledWith(expect.objectContaining({}));
          });
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
        expect(hooks[hook]).toHaveBeenCalledWith(expect.objectContaining({}));
      });
    });
  });
});
