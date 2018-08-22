const { Implementation: Field } = require('../Implementation');

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
    expect(impl.config).toEqual({});
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

test('getGraphqlAuxiliaryTypes()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getGraphqlAuxiliaryTypes();
  expect(value).toBe(undefined);
});

test('getGraphqlAuxiliaryTypeResolvers()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getGraphqlAuxiliaryTypeResolvers();
  expect(value).toBe(undefined);
});

test('getGraphqlAuxiliaryQueries()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getGraphqlAuxiliaryQueries();
  expect(value).toBe(undefined);
});

test('getGraphqlAuxiliaryQueryResolvers()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getGraphqlAuxiliaryQueryResolvers();
  expect(value).toBe(undefined);
});

test('getGraphqlAuxiliaryMutations()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getGraphqlAuxiliaryMutations();
  expect(value).toBe(undefined);
});

test('getGraphqlAuxiliaryMutationResolvers()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getGraphqlAuxiliaryMutationResolvers();
  expect(value).toBe(undefined);
});

test('createFieldPreHook()', () => {
  const impl = new Field('path', config, args);

  const data = { a: 1 };
  const value = impl.createFieldPreHook(data);
  expect(value).toEqual(data);
});

test('createFieldPostHook()', () => {
  const impl = new Field('path', config, args);

  const value = impl.createFieldPostHook();
  expect(value).toBe(undefined);
});

test('updateFieldPreHook()', () => {
  const impl = new Field('path', config, args);

  const data = { a: 1 };
  const value = impl.updateFieldPreHook(data);
  expect(value).toEqual(data);
});

test('updateFieldPostHook()', () => {
  const impl = new Field('path', config, args);

  const value = impl.updateFieldPostHook();
  expect(value).toBe(undefined);
});

test('getGraphqlQueryArgs()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getGraphqlQueryArgs();
  expect(value).toBe(undefined);
});

test('getGraphqlUpdateArgs()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getGraphqlUpdateArgs();
  expect(value).toBe(undefined);
});

test('getGraphqlOutputFieldResolvers()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getGraphqlOutputFieldResolvers();
  expect(value).toBe(undefined);
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
