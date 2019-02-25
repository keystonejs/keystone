import { Controller } from './Controller';

const config = {
  path: 'path',
  label: 'label',
  type: 'type',
  list: 'list',
  adminMeta: 'adminMeta',
  defaultValue: 'default',
};

describe('new Controller()', () => {
  test('new Controller() - Smoke test', () => {
    const controller = new Controller(config, 'list', 'adminMeta');
    expect(controller).not.toBeNull();

    expect(controller.config).toEqual(config);
    expect(controller.label).toEqual('label');
    expect(controller.type).toEqual('type');
    expect(controller.list).toEqual('list');
    expect(controller.adminMeta).toEqual('adminMeta');
  });
});

test('getQueryFragment()', () => {
  const controller = new Controller(config, 'list', 'adminMeta');

  const value = controller.getQueryFragment();
  expect(value).toEqual('path');
});

describe('getValue()', () => {
  test('getValue() - path exists', () => {
    const controller = new Controller(config, 'list', 'adminMeta');
    let value = controller.getValue({ path: 'some_value' });
    expect(value).toEqual('some_value');
  });

  test('getValue() - path does not exist', () => {
    const controller = new Controller(config, 'list', 'adminMeta');
    const value = controller.getValue({});
    expect(value).toEqual('');
  });
});

describe('getInitialData()', () => {
  test('getInitialData() - Default defined', () => {
    const controller = new Controller(config, 'list', 'adminMeta');
    const value = controller.getInitialData();
    expect(value).toEqual('default');
  });

  test('getInitialData() - No default', () => {
    const controller = new Controller({}, 'list', 'adminMeta');
    const value = controller.getInitialData();
    expect(value).toEqual('');
  });
});
