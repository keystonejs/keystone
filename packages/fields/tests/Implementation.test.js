const { Implementation: Field } = require('../');

const config = {
  label: 'config label',
  defaultValue: 'default',
};

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
    const impl = new Field('path', config, args);
    expect(impl.label).toEqual('config label');
  });
});

test('addToMongooseSchema()', () => {
  const impl = new Field('path', config, args);

  expect(() => {
    impl.adapter.addToMongooseSchema();
  }).toThrow(Error);
});

test('getGqlAuxTypes()', () => {
  const impl = new Field('path', config, args);

  expect(impl.getGqlAuxTypes()).toEqual([]);
});

test('gqlAuxFieldResolvers', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlAuxFieldResolvers).toEqual({});
});

test('getGqlAuxQueries()', () => {
  const impl = new Field('path', config, args);

  expect(impl.getGqlAuxQueries()).toEqual([]);
});

test('gqlAuxQueryResolvers', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlAuxQueryResolvers).toEqual({});
});

test('getGqlAuxMutations()', () => {
  const impl = new Field('path', config, args);

  expect(impl.getGqlAuxMutations()).toEqual([]);
});

test('gqlAuxMutationResolvers', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlAuxMutationResolvers).toEqual({});
});

test('afterChange()', async () => {
  const impl = new Field('path', config, args);

  const value = await impl.afterChange();
  expect(value).toBe(undefined);
});

test('resolveInput()', async () => {
  const impl = new Field('path', config, args);

  const resolvedData = { path: 1 };
  const value = await impl.resolveInput({ resolvedData });
  expect(value).toEqual(1);
});

test('gqlQueryInputFields', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlQueryInputFields).toEqual([]);
});

test('gqlUpdateInputFields', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlUpdateInputFields).toEqual([]);
});

test('gqlOutputFieldResolvers', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlOutputFieldResolvers).toEqual({});
});

test('getAdminMeta()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getAdminMeta();
  expect(value).toEqual({
    label: 'config label',
    path: 'path',
    type: 'Field',
    defaultValue: 'default',
  });
});

test('extendAdminMeta()', () => {
  const impl = new Field('path', config, args);

  const meta = { a: 1 };
  const value = impl.extendAdminMeta(meta);
  expect(value).toEqual(meta);
});
