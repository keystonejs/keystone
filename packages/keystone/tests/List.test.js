const gql = require('graphql-tag');
const { print } = require('graphql/language/printer');

// We don't want to actually log, so we mock it before we require the class
jest.doMock('@keystonejs/logger', () => ({
  logger: jest.fn(() => ({ warn: () => {}, log: () => {}, debug: () => {}, info: () => {} })),
}));

const List = require('../lib/List');
const { AccessDeniedError } = require('../lib/List/graphqlErrors');
const { Text, Checkbox, Float, Relationship, Integer } = require('@keystonejs/fields');
const { getType } = require('@keystonejs/utils');
const path = require('path');

let fieldsPackagePath = path.dirname(require.resolve('@keystonejs/fields/package.json'));
function resolveViewPath(viewPath) {
  return path.join(fieldsPackagePath, 'src', 'types', viewPath);
}

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
  get gqlUpdateInputFields() {
    return ['id: ID'];
  }
  get gqlCreateInputFields() {
    return ['id: ID'];
  }
  getGqlAuxTypes() {
    return [];
  }
  getGqlAuxQueries() {
    return [];
  }
  getGqlAuxMutations() {
    return [];
  }
  gqlOutputFieldResolvers() {
    return {};
  }
  gqlAuxQueryResolvers() {
    return {};
  }
  gqlAuxMutationResolvers() {
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
class MockFieldAdapter {}

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

class MockPasswordAuthStrategy {
  getInputFragment = () => 'password: String';
  validate = () => {};
}

Text.adapters['mock'] = {};
Checkbox.adapters['mock'] = {};
Float.adapters['mock'] = {};
Relationship.adapters['mock'] = {};

const context = {
  getListAccessControlForUser: () => true,
  getFieldAccessControlForUser: (listKey, fieldPath, originalInput, existingItem) =>
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
        public: {
          read: true,
        },
      },
    };
  }
};

const listExtras = (getAuth = () => {}, queryMethod = undefined) => ({
  getListByKey,
  adapter: new MockAdapter(),
  getAuth,
  defaultAccess: { list: true, field: true },
  queryHelper: context => (queryString, { variables } = {}) => {
    return queryMethod(queryString, context, variables);
  },
  registerType: () => {},
  schemaNames: ['public'],
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
      authenticateMutationPrefix: 'authenticateTest',
      authenticateOutputName: 'authenticateTestOutput',
      unauthenticateMutationName: 'unauthenticateTest',
      unauthenticateOutputName: 'unauthenticateTestOutput',
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
      listMetaName: '_TestsMeta',
      authenticatedQueryName: 'authenticatedTest',
      authenticateMutationPrefix: 'authenticateTest',
      authenticateOutputName: 'authenticateTestOutput',
      unauthenticateMutationName: 'unauthenticateTest',
      unauthenticateOutputName: 'unauthenticateTestOutput',
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
    const schemaName = 'public';
    const adminMeta = list.getAdminMeta({ schemaName });

    expect(adminMeta.fields).toHaveLength(5);
    expect(adminMeta.fields[0].path).toEqual('id');
    expect(adminMeta.fields[1].path).toEqual('name');
    expect(adminMeta.fields[2].path).toEqual('email');
    expect(adminMeta.fields[3].path).toEqual('other');
    expect(adminMeta.fields[4].path).toEqual('writeOnce');
  });

  test('getAdminMeta() - views', () => {
    const list = setup();
    const schemaName = 'public';
    const adminMeta = list.getAdminMeta({ schemaName });

    expect(adminMeta.views).toEqual({
      id: {}, // Mocked
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

[false, true].forEach(withAuth => {
  [false, true].forEach(auth => {
    describe(`getGqlTypes() ${
      withAuth ? 'with' : 'without'
    } auth (access: { auth: ${auth} })`, () => {
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
      const unauthenticateOutput = `type unauthenticateTestOutput {
      """
        \`true\` when unauthentication succeeds.
        NOTE: unauthentication always succeeds when the request has an invalid or missing authentication token.
        """
        success: Boolean
      }`;
      const authenticateOutput = `type authenticateTestOutput {
        """ Used to make subsequent authenticated requests by setting this token in a header: 'Authorization: Bearer <token>'. """
        token: String
        """ Retreive information on the newly authenticated Test here. """
        item: Test
      }`;

      const getAuth = withAuth ? () => ({ password: new MockPasswordAuthStrategy() }) : undefined;
      const schemaName = 'public';
      test('access: true', () => {
        expect(
          setup({ access: true }, getAuth)
            .getGqlTypes({ schemaName })
            .map(s => print(gql(s)))
        ).toEqual(
          [
            type,
            whereInput,
            whereUniqueInput,
            updateInput,
            updateManyInput,
            createInput,
            createManyInput,
            ...(withAuth ? [unauthenticateOutput, authenticateOutput] : []),
          ].map(s => print(gql(s)))
        );
      });
      test('access: false', () => {
        expect(
          setup({ access: false }, getAuth)
            .getGqlTypes({ schemaName })
            .map(s => print(gql(s)))
        ).toEqual([]);
      });
      test('read: true', () => {
        expect(
          setup(
            { access: { read: true, create: false, update: false, delete: false, auth } },
            getAuth
          )
            .getGqlTypes({ schemaName })
            .map(s => print(gql(s)))
        ).toEqual(
          [
            type,
            whereInput,
            whereUniqueInput,
            ...(withAuth && auth ? [unauthenticateOutput, authenticateOutput] : []),
          ].map(s => print(gql(s)))
        );
      });
      test('create: true', () => {
        expect(
          setup(
            { access: { read: false, create: true, update: false, delete: false, auth } },
            getAuth
          )
            .getGqlTypes({ schemaName })
            .map(s => print(gql(s)))
        ).toEqual(
          [
            type,
            whereInput,
            whereUniqueInput,
            createInput,
            createManyInput,
            ...(withAuth && auth ? [unauthenticateOutput, authenticateOutput] : []),
          ].map(s => print(gql(s)))
        );
      });
      test('update: true', () => {
        expect(
          setup(
            { access: { read: false, create: false, update: true, delete: false, auth } },
            getAuth
          )
            .getGqlTypes({ schemaName })
            .map(s => print(gql(s)))
        ).toEqual(
          [
            type,
            whereInput,
            whereUniqueInput,
            updateInput,
            updateManyInput,
            ...(withAuth && auth ? [unauthenticateOutput, authenticateOutput] : []),
          ].map(s => print(gql(s)))
        );
      });
      test('delete: true', () => {
        expect(
          setup(
            { access: { read: false, create: false, update: false, delete: true, auth } },
            getAuth
          )
            .getGqlTypes({ schemaName })
            .map(s => print(gql(s)))
        ).toEqual(
          [
            type,
            whereInput,
            whereUniqueInput,
            ...(withAuth && auth ? [unauthenticateOutput, authenticateOutput] : []),
          ].map(s => print(gql(s)))
        );
      });
    });
  });
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

[false, true].forEach(withAuth => {
  describe(`getGqlQueries() ${withAuth ? 'with' : 'without'} auth`, () => {
    const getAuth = withAuth ? () => ({ password: new MockPasswordAuthStrategy() }) : undefined;
    const schemaName = 'public';
    test('access: true', () => {
      expect(
        setup({ access: true }, getAuth)
          .getGqlQueries({ schemaName })
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
          ...(withAuth ? [`authenticatedTest: Test`] : []),
        ].map(normalise)
      );
    });
    test('access: false', () => {
      expect(
        setup({ access: false }, getAuth)
          .getGqlQueries({ schemaName })
          .map(normalise)
      ).toEqual([]);
    });
  });
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

test('_wrapFieldResolverWith', () => {
  const resolver = () => 'result';
  const list = setup();
  const newResolver = list._wrapFieldResolver(list.fieldsByPath['name'], resolver);
  expect(newResolver({}, {}, context)).toEqual('result');
  expect(() => newResolver({ makeFalse: true }, {}, context)).toThrow(AccessDeniedError);
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

test('gqlAuxMutationResolvers', () => {
  const list = setup();
  expect(list.gqlAuxMutationResolvers()).toEqual({});
});

[false, true].forEach(withAuth => {
  [false, true].forEach(auth => {
    describe(`getGqlMutations() ${
      withAuth ? 'with' : 'without'
    } auth (access: { auth: ${auth} })`, () => {
      const getAuth = withAuth ? () => ({ password: new MockPasswordAuthStrategy() }) : undefined;
      const extraConfig = {};
      const schemaName = 'public';
      test('access: true', () => {
        expect(
          setup({ access: true, ...extraConfig }, getAuth)
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
            ...(withAuth
              ? [
                  `unauthenticateTest: unauthenticateTestOutput`,
                  `""" Authenticate and generate a token for a Test with the Password Authentication Strategy. """ authenticateTestWithPassword(password: String): authenticateTestOutput`,
                ]
              : []),
          ].map(normalise)
        );
      });
      test('access: false', () => {
        expect(
          setup({ access: false, ...extraConfig }, getAuth)
            .getGqlMutations({ schemaName })
            .map(normalise)
        ).toEqual([]);
      });
      test('read: true', () => {
        expect(
          setup(
            {
              access: { read: true, create: false, update: false, delete: false, auth },
              ...extraConfig,
            },
            getAuth
          )
            .getGqlMutations({ schemaName })
            .map(normalise)
        ).toEqual(
          [
            ...(withAuth && auth
              ? [
                  `unauthenticateTest: unauthenticateTestOutput`,
                  `""" Authenticate and generate a token for a Test with the Password Authentication Strategy. """ authenticateTestWithPassword(password: String): authenticateTestOutput`,
                ]
              : []),
          ].map(normalise)
        );
      });
      test('create: true', () => {
        expect(
          setup(
            {
              access: { read: false, create: true, update: false, delete: false, auth },
              ...extraConfig,
            },
            getAuth
          )
            .getGqlMutations({ schemaName })
            .map(normalise)
        ).toEqual(
          [
            `""" Create a single Test item. """ createTest(data: TestCreateInput): Test`,
            `""" Create multiple Test items. """ createTests(data: [TestsCreateInput]): [Test]`,
            ...(withAuth && auth
              ? [
                  `unauthenticateTest: unauthenticateTestOutput`,
                  `""" Authenticate and generate a token for a Test with the Password Authentication Strategy. """ authenticateTestWithPassword(password: String): authenticateTestOutput`,
                ]
              : []),
          ].map(normalise)
        );
      });
      test('update: true', () => {
        expect(
          setup(
            {
              access: { read: false, create: false, update: true, delete: false, auth },
              ...extraConfig,
            },
            getAuth
          )
            .getGqlMutations({ schemaName })
            .map(normalise)
        ).toEqual(
          [
            `""" Update a single Test item by ID. """ updateTest(id: ID! data: TestUpdateInput): Test`,
            `""" Update multiple Test items by ID. """ updateTests(data: [TestsUpdateInput]): [Test]`,
            ...(withAuth && auth
              ? [
                  `unauthenticateTest: unauthenticateTestOutput`,
                  `""" Authenticate and generate a token for a Test with the Password Authentication Strategy. """ authenticateTestWithPassword(password: String): authenticateTestOutput`,
                ]
              : []),
          ].map(normalise)
        );
      });
      test('delete: true', () => {
        expect(
          setup(
            {
              access: { read: false, create: false, update: false, delete: true, auth },
              ...extraConfig,
            },
            getAuth
          )
            .getGqlMutations({ schemaName })
            .map(normalise)
        ).toEqual(
          [
            `""" Delete a single Test item by ID. """ deleteTest(id: ID!): Test`,
            `""" Delete multiple Test items by ID. """ deleteTests(ids: [ID!]): [Test]`,
            ...(withAuth && auth
              ? [
                  `unauthenticateTest: unauthenticateTestOutput`,
                  `""" Authenticate and generate a token for a Test with the Password Authentication Strategy. """ authenticateTestWithPassword(password: String): authenticateTestOutput`,
                ]
              : []),
          ].map(normalise)
        );
      });
    });
  });
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
  const originalInput = {};
  expect(list.checkListAccess(context, originalInput, 'read', { gqlName: 'testing' })).toEqual(
    true
  );

  const newContext = {
    ...context,
    getListAccessControlForUser: (listKey, originalInput, operation) => operation === 'update',
  };
  expect(list.checkListAccess(newContext, originalInput, 'update', { gqlName: 'testing' })).toEqual(
    true
  );
  expect(() =>
    list.checkListAccess(newContext, originalInput, 'read', { gqlName: 'testing' })
  ).toThrow(AccessDeniedError);
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

[false, true].forEach(withAuth => {
  test(`gqlQueryResolvers ${withAuth ? 'with' : 'without'} auth`, () => {
    const getAuth = withAuth ? () => ({ password: new MockPasswordAuthStrategy() }) : undefined;
    const schemaName = 'public';
    const resolvers = setup({ access: true }, getAuth).gqlQueryResolvers({ schemaName });
    expect(resolvers['allTests']).toBeInstanceOf(Function); // listQueryName
    expect(resolvers['_allTestsMeta']).toBeInstanceOf(Function); // listQueryMetaName
    expect(resolvers['_TestsMeta']).toBeInstanceOf(Function); // listMetaName
    expect(resolvers['Test']).toBeInstanceOf(Function); // itemQueryName
    if (withAuth) {
      expect(resolvers['authenticatedTest']).toBeInstanceOf(Function); // authenticatedQueryName
    } else {
      expect(resolvers['authenticatedTest']).toBe(undefined); // authenticatedQueryName
    }

    const resolvers2 = setup({ access: false }, getAuth).gqlQueryResolvers({ schemaName });
    expect(resolvers2['allTests']).toBe(undefined); // listQueryName
    expect(resolvers2['_allTestsMeta']).toBe(undefined); // listQueryMetaName
    expect(resolvers2['_TestsMeta']).toBe(undefined); // listMetaName
    expect(resolvers2['Test']).toBe(undefined); // itemQueryName
    if (withAuth) {
      expect(resolvers['authenticatedTest']).toBeInstanceOf(Function); // authenticatedQueryName
    } else {
      expect(resolvers['authenticatedTest']).toBe(undefined); // authenticatedQueryName
    }
  });
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

[false, true].forEach(withAuth => {
  test(`listMeta ${withAuth ? 'with' : 'without'} auth`, () => {
    const getAuth = withAuth ? () => ({ password: new MockPasswordAuthStrategy() }) : undefined;
    const meta = setup({}, getAuth).listMeta(context);
    expect(meta.getAccess).toBeInstanceOf(Function);
    expect(meta.getSchema).toBeInstanceOf(Function);
    expect(meta.name).toEqual('Test');

    const access = meta.getAccess();
    expect(access.getCreate).toBeInstanceOf(Function);
    expect(access.getDelete).toBeInstanceOf(Function);
    expect(access.getRead).toBeInstanceOf(Function);
    expect(access.getUpdate).toBeInstanceOf(Function);
    expect(access.getAuth).toBeInstanceOf(Function);

    expect(access.getCreate()).toEqual(true);
    expect(access.getDelete()).toEqual(true);
    expect(access.getRead()).toEqual(true);
    expect(access.getUpdate()).toEqual(true);
    expect(access.getAuth()).toEqual(true);

    const schema = meta.getSchema();
    expect(schema).toEqual({
      key: 'Test',
      queries: ['Test', 'allTests', '_allTestsMeta', ...(withAuth ? ['authenticatedTest'] : [])],
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

[false, true].forEach(withAuth => {
  [false, true].forEach(auth => {
    describe(`gqlMutationResolvers ${
      withAuth ? 'with' : 'without'
    } auth (access: { auth: ${auth} })`, () => {
      const getAuth = withAuth ? () => ({ password: new MockPasswordAuthStrategy() }) : undefined;
      const schemaName = 'public';
      let resolvers;
      test('access: true', () => {
        resolvers = setup({ access: true }, getAuth).gqlMutationResolvers({ schemaName });
        expect(resolvers['createTest']).toBeInstanceOf(Function);
        expect(resolvers['updateTest']).toBeInstanceOf(Function);
        expect(resolvers['deleteTest']).toBeInstanceOf(Function);
        expect(resolvers['deleteTests']).toBeInstanceOf(Function);
        if (withAuth) {
          expect(resolvers['authenticateTestWithPassword']).toBeInstanceOf(Function);
          expect(resolvers['unauthenticateTest']).toBeInstanceOf(Function);
        } else {
          expect(resolvers['authenticateTestWithPassword']).toBe(undefined);
          expect(resolvers['unauthenticateTest']).toBe(undefined);
        }
      });
      test('access: false', () => {
        resolvers = setup({ access: false }, getAuth).gqlMutationResolvers({ schemaName });
        expect(resolvers['authenticateTestWithPassword']).toBe(undefined);
        expect(resolvers['unauthenticateTest']).toBe(undefined);
      });
      test('read: true', () => {
        resolvers = setup(
          { access: { read: true, create: false, update: false, delete: false, auth } },
          getAuth
        ).gqlMutationResolvers({ schemaName });
        if (withAuth && auth) {
          expect(resolvers['authenticateTestWithPassword']).toBeInstanceOf(Function);
          expect(resolvers['unauthenticateTest']).toBeInstanceOf(Function);
        } else {
          expect(resolvers['authenticateTestWithPassword']).toBe(undefined);
          expect(resolvers['unauthenticateTest']).toBe(undefined);
        }
      });
      test('create: true', () => {
        resolvers = setup(
          { access: { read: false, create: true, update: false, delete: false, auth } },
          getAuth
        ).gqlMutationResolvers({ schemaName });
        expect(resolvers['createTest']).toBeInstanceOf(Function);
        expect(resolvers['updateTest']).toBe(undefined);
        expect(resolvers['deleteTest']).toBe(undefined);
        expect(resolvers['deleteTests']).toBe(undefined);
        if (withAuth && auth) {
          expect(resolvers['authenticateTestWithPassword']).toBeInstanceOf(Function);
          expect(resolvers['unauthenticateTest']).toBeInstanceOf(Function);
        } else {
          expect(resolvers['authenticateTestWithPassword']).toBe(undefined);
          expect(resolvers['unauthenticateTest']).toBe(undefined);
        }
      });
      test('update: true', () => {
        resolvers = setup(
          { access: { read: false, create: false, update: true, delete: false, auth } },
          getAuth
        ).gqlMutationResolvers({ schemaName });
        expect(resolvers['createTest']).toBe(undefined);
        expect(resolvers['updateTest']).toBeInstanceOf(Function);
        expect(resolvers['deleteTest']).toBe(undefined);
        expect(resolvers['deleteTests']).toBe(undefined);
        if (withAuth && auth) {
          expect(resolvers['authenticateTestWithPassword']).toBeInstanceOf(Function);
          expect(resolvers['unauthenticateTest']).toBeInstanceOf(Function);
        } else {
          expect(resolvers['authenticateTestWithPassword']).toBe(undefined);
          expect(resolvers['unauthenticateTest']).toBe(undefined);
        }
      });
      test('delete: true', () => {
        resolvers = setup(
          { access: { read: false, create: false, update: false, delete: true, auth } },
          getAuth
        ).gqlMutationResolvers({ schemaName });
        expect(resolvers['createTest']).toBe(undefined);
        expect(resolvers['updateTest']).toBe(undefined);
        expect(resolvers['deleteTest']).toBeInstanceOf(Function);
        expect(resolvers['deleteTests']).toBeInstanceOf(Function);
        if (withAuth && auth) {
          expect(resolvers['authenticateTestWithPassword']).toBeInstanceOf(Function);
          expect(resolvers['unauthenticateTest']).toBeInstanceOf(Function);
        } else {
          expect(resolvers['authenticateTestWithPassword']).toBe(undefined);
          expect(resolvers['unauthenticateTest']).toBe(undefined);
        }
      });
    });
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
          registerType: () => {},
          schemaNames: ['public'],
        }
      );
      list.initFields();
      expect(list.fieldsByPath.foo).toBeInstanceOf(keystoneType.implementation);
    });
  });
});
