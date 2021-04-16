import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { KeystoneContext } from '@keystone-next/types';
import { Implementation as Field } from '../';

const args = {
  getListByKey: () => undefined,
  listKey: 'key',
  listAdapter: ({ newFieldAdapter: jest.fn() } as unknown) as PrismaListAdapter,
  schemaNames: ['public'],
  fieldAdapterClass: {} as typeof PrismaFieldAdapter,
};

describe('new Implementation()', () => {
  test('new Implementation() - Smoke test', () => {
    const impl = new Field(
      'path',
      {},
      {
        getListByKey: () => undefined,
        listKey: 'key',
        listAdapter: ({ newFieldAdapter: jest.fn() } as unknown) as PrismaListAdapter,
        schemaNames: ['public'],
        fieldAdapterClass: {} as typeof PrismaFieldAdapter,
      }
    );
    expect(impl).not.toBeNull();
    expect(impl.path).toEqual('path');
    expect(impl.listKey).toEqual('key');
    expect(impl.label).toEqual('Path');
  });

  test('new Implementation - label from config', () => {
    const impl = new Field('path', { label: 'config label' }, args);
    expect(impl.label).toEqual('config label');
  });
});

test('getGqlAuxTypes()', () => {
  const impl = new Field('path', {}, args);
  const schemaName = 'public';
  expect(impl.getGqlAuxTypes({ schemaName })).toEqual([]);
});

test('gqlAuxFieldResolvers', () => {
  const impl = new Field('path', {}, args);
  const schemaName = 'public';
  expect(impl.gqlAuxFieldResolvers({ schemaName })).toEqual({});
});

test('getGqlAuxQueries()', () => {
  const impl = new Field('path', {}, args);

  expect(impl.getGqlAuxQueries()).toEqual([]);
});

test('gqlAuxQueryResolvers', () => {
  const impl = new Field('path', {}, args);

  expect(impl.gqlAuxQueryResolvers()).toEqual({});
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
  const schemaName = 'public';
  expect(impl.gqlQueryInputFields({ schemaName })).toEqual([]);
});

test('gqlUpdateInputFields', () => {
  const impl = new Field('path', {}, args);
  const schemaName = 'public';
  expect(impl.gqlUpdateInputFields({ schemaName })).toEqual([]);
});

test('gqlOutputFieldResolvers', () => {
  const impl = new Field('path', {}, args);
  const schemaName = 'public';
  expect(impl.gqlOutputFieldResolvers({ schemaName })).toEqual({});
});

describe('getDefaultValue()', () => {
  test('undefined by default', () => {
    const impl = new Field('path', {}, args);
    const context = {} as KeystoneContext;
    const originalInput = {};
    const value = impl.getDefaultValue({ context, originalInput });
    expect(value).toEqual(undefined);
  });

  test('static value is returned', () => {
    const impl = new Field('path', { defaultValue: 'foobar' }, args);
    const context = {} as KeystoneContext;
    const originalInput = {};
    const value = impl.getDefaultValue({ context, originalInput });
    expect(value).toEqual('foobar');
  });

  test('executes a function', () => {
    const defaultValue = jest.fn(() => 'foobar');
    const context = {} as KeystoneContext;
    const originalInput = {};

    const impl = new Field('path', { defaultValue }, args);

    const value = impl.getDefaultValue({ context, originalInput });
    expect(value).toEqual('foobar');
    expect(defaultValue).toHaveBeenCalledTimes(1);
    expect(defaultValue).toHaveBeenCalledWith({ context, originalInput });
  });
});
