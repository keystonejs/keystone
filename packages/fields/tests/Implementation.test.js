const { Implementation: Field } = require('../');

const args = {
  getListByKey: {},
  listKey: {},
  listAdapter: {
    newFieldAdapter: jest.fn(),
  },
  defaultAccess: true,
};

describe('new Implementation()', () => {
  test('new Implementation() - Smoke test', () => {
    const impl = new Field(
      'path',
      {},
      {
        getListByKey: {},
        listKey: {},
        listAdapter: {
          newFieldAdapter: jest.fn(),
        },
        defaultAccess: true,
      }
    );
    expect(impl).not.toBeNull();
    expect(impl.path).toEqual('path');
    expect(impl.getListByKey).toEqual({});
    expect(impl.listKey).toEqual({});
    expect(impl.label).toEqual('Path');
  });

  test('new Implementation - label from config', () => {
    const impl = new Field('path', { label: 'config label' }, args);
    expect(impl.label).toEqual('config label');
  });
});

test('addToMongooseSchema()', () => {
  const impl = new Field('path', {}, args);

  expect(() => {
    impl.adapter.addToMongooseSchema();
  }).toThrow(Error);
});

test('getGqlAuxTypes()', () => {
  const impl = new Field('path', {}, args);

  expect(impl.getGqlAuxTypes()).toEqual([]);
});

test('gqlAuxFieldResolvers', () => {
  const impl = new Field('path', {}, args);

  expect(impl.gqlAuxFieldResolvers).toEqual({});
});

test('getGqlAuxQueries()', () => {
  const impl = new Field('path', {}, args);

  expect(impl.getGqlAuxQueries()).toEqual([]);
});

test('gqlAuxQueryResolvers', () => {
  const impl = new Field('path', {}, args);

  expect(impl.gqlAuxQueryResolvers).toEqual({});
});

test('getGqlAuxMutations()', () => {
  const impl = new Field('path', {}, args);

  expect(impl.getGqlAuxMutations()).toEqual([]);
});

test('gqlAuxMutationResolvers', () => {
  const impl = new Field('path', {}, args);

  expect(impl.gqlAuxMutationResolvers).toEqual({});
});

test('afterChange()', async () => {
  const impl = new Field('path', {}, args);

  const value = await impl.afterChange();
  expect(value).toBe(undefined);
});

test('resolveInput()', async () => {
  const impl = new Field('path', {}, args);

  const resolvedData = { path: 1 };
  const value = await impl.resolveInput({ resolvedData });
  expect(value).toEqual(1);
});

test('gqlQueryInputFields', () => {
  const impl = new Field('path', {}, args);

  expect(impl.gqlQueryInputFields).toEqual([]);
});

test('gqlUpdateInputFields', () => {
  const impl = new Field('path', {}, args);

  expect(impl.gqlUpdateInputFields).toEqual([]);
});

test('gqlOutputFieldResolvers', () => {
  const impl = new Field('path', {}, args);

  expect(impl.gqlOutputFieldResolvers).toEqual({});
});

describe('getAdminMeta()', () => {
  test('meta is as expect', () => {
    const impl = new Field('path', { label: 'config label', defaultValue: 'default' }, args);

    const value = impl.getAdminMeta();
    expect(value).toEqual({
      label: 'config label',
      path: 'path',
      type: 'Field',
      defaultValue: 'default',
      isPrimaryKey: false,
      isRequired: false,
    });
  });

  test('when defaultValue is a function, forced to `undefined`', () => {
    const impl = new Field('path', { label: 'config label', defaultValue: () => 'default' }, args);

    const value = impl.getAdminMeta();
    expect(value).toEqual({
      label: 'config label',
      path: 'path',
      type: 'Field',
      defaultValue: undefined,
      isPrimaryKey: false,
      isRequired: false,
    });
  });
});

test('extendAdminMeta()', () => {
  const impl = new Field('path', {}, args);

  const meta = { a: 1 };
  const value = impl.extendAdminMeta(meta);
  expect(value).toEqual(meta);
});

describe('getDefaultValue()', () => {
  test('undefined by default', () => {
    const impl = new Field('path', {}, args);

    const value = impl.getDefaultValue({});
    expect(value).toEqual(undefined);
  });

  test('static value is returned', () => {
    const impl = new Field('path', { defaultValue: 'foobar' }, args);

    const value = impl.getDefaultValue({});
    expect(value).toEqual('foobar');
  });

  test('executes a function', () => {
    const defaultValue = jest.fn(() => 'foobar');
    const existingItem = {};
    const context = {};
    const originalInput = {};
    const actions = {};

    const impl = new Field('path', { defaultValue }, args);

    const value = impl.getDefaultValue({ existingItem, context, originalInput, actions });
    expect(value).toEqual('foobar');
    expect(defaultValue).toHaveBeenCalledTimes(1);
    expect(defaultValue).toHaveBeenCalledWith({ existingItem, context, originalInput, actions });
  });
});
