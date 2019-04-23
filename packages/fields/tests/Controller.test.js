import FieldController from '../Controller';

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
    const controller = new FieldController(config, 'list', 'adminMeta');
    expect(controller).not.toBeNull();

    expect(controller.config).toEqual(config);
    expect(controller.label).toEqual('label');
    expect(controller.type).toEqual('type');
    expect(controller.list).toEqual('list');
    expect(controller.adminMeta).toEqual('adminMeta');
  });
});

test('getQueryFragment()', () => {
  const controller = new FieldController(config, 'list', 'adminMeta');

  const value = controller.getQueryFragment();
  expect(value).toEqual('path');
});

describe('serialize()', () => {
  test('serialize() - path exists', () => {
    const controller = new FieldController(config, 'list', 'adminMeta');
    let value = controller.serialize({ path: 'some_value' });
    expect(value).toEqual('some_value');
  });

  test('serialize() - path does not exist', () => {
    const controller = new FieldController(config, 'list', 'adminMeta');
    const value = controller.serialize({});
    expect(value).toEqual(null);
  });
});

describe('deserialize()', () => {
  test('deserialize() - path exists', () => {
    const controller = new FieldController(config, 'list', 'adminMeta');
    let value = controller.deserialize({ path: 'some_value' });
    expect(value).toEqual('some_value');
  });

  test('deserialize() - path does not exist', () => {
    const controller = new FieldController(config, 'list', 'adminMeta');
    const value = controller.deserialize({});
    expect(value).toEqual(undefined);
  });
});

describe('getDefaultValue()', () => {
  test('getDefaultValue() - Default defined', () => {
    const controller = new FieldController(config, 'list', 'adminMeta');
    const value = controller.getDefaultValue();
    expect(value).toEqual('default');
  });

  test('getDefaultValue() - No default', () => {
    const controller = new FieldController({}, 'list', 'adminMeta');
    const value = controller.getDefaultValue();
    expect(value).toEqual('');
  });
});
