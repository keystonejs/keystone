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

test('gqlAuxTypes', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlAuxTypes).toEqual([]);
});

test('gqlAuxFieldResolvers', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlAuxFieldResolvers).toEqual({});
});

test('gqlAuxQueries', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlAuxQueries).toEqual([]);
});

test('gqlAuxQueryResolvers', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlAuxQueryResolvers).toEqual({});
});

test('gqlAuxMutations', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlAuxMutations).toEqual([]);
});

test('gqlAuxMutationResolvers', () => {
  const impl = new Field('path', config, args);

  expect(impl.gqlAuxMutationResolvers).toEqual({});
});

test('afterChange()', () => {
  const impl = new Field('path', config, args);

  const value = impl.afterChange();
  expect(value).toBe(undefined);
});

test('resolveInput()', () => {
  const impl = new Field('path', config, args);

  const data = { a: 1 };
  const value = impl.resolveInput(data);
  expect(value).toEqual(data);
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
