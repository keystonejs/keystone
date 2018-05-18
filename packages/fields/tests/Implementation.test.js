const Field = require('../Implementation');

const config = {
  label: 'config label',
  defaultValue: 'default',
};

const args = {
  getListByKey: {},
  listKey: {},
};

describe('new Implementation()', () => {
  test('new Implementation() - Smoke test', () => {
    const impl = new Field(
      'path',
      {},
      {
        getListByKey: {},
        listKey: {},
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
    impl.addToMongooseSchema();
  }).toThrow(Error);
});

test('getGraphqlSchema()', () => {
  const impl = new Field('path', config, args);

  // By default graphQLType is undefined and getGraphqlSchema should throw an Error.
  expect(impl.graphQLType).toBe(undefined);
  expect(() => {
    impl.getGraphqlSchema();
  }).toThrowError(Error);

  // Setting graphQLType should cause the method to return a valid value.
  impl.graphQLType = 'graphQL type';
  const value = impl.getGraphqlSchema();
  expect(value).toEqual('path: graphQL type');
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

test('getGraphqlFieldResolvers()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getGraphqlFieldResolvers();
  expect(value).toBe(undefined);
});

test('getQueryConditions()', () => {
  const impl = new Field('path', config, args);

  const value = impl.getQueryConditions();
  expect(value).toEqual([]);
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
