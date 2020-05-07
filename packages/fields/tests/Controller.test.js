import FieldController from '../Controller';

const config = {
  path: 'path',
  label: 'label',
  type: 'type',
};

describe('new Controller()', () => {
  test('new Controller() - Smoke test', () => {
    const controller = new FieldController(config, 'adminMeta');
    expect(controller).not.toBeNull();

    expect(controller.config).toEqual({});
    expect(controller.label).toEqual('label');
    expect(controller.type).toEqual('type');
  });
});

test('getQueryFragment()', () => {
  const controller = new FieldController(config, 'adminMeta');

  const value = controller.getQueryFragment();
  expect(value).toEqual('path');
});

describe('serialize()', () => {
  test('serialize() - path exists', () => {
    const controller = new FieldController(config, 'adminMeta');
    let value = controller.serialize({ path: 'some_value' });
    expect(value).toEqual('some_value');
  });

  test('serialize() - path does not exist', () => {
    const controller = new FieldController(config, 'adminMeta');
    const value = controller.serialize({});
    expect(value).toEqual(null);
  });
});

describe('deserialize()', () => {
  test('deserialize() - path exists', () => {
    const controller = new FieldController(config, 'adminMeta');
    let value = controller.deserialize({ path: 'some_value' });
    expect(value).toEqual('some_value');
  });

  test('deserialize() - path does not exist', () => {
    const controller = new FieldController(config, 'adminMeta');
    const value = controller.deserialize({});
    expect(value).toEqual(undefined);
  });
});

describe('getDefaultValue()', () => {
  test('No default', () => {
    const controller = new FieldController(config, 'adminMeta');
    const value = controller.getDefaultValue({});
    expect(value).toEqual(undefined);
  });

  test('Default defined as `undefined`', () => {
    const controller = new FieldController({ ...config, defaultValue: undefined }, 'adminMeta');
    const value = controller.getDefaultValue({});
    expect(value).toEqual(undefined);
  });

  test('Default defined as `null`', () => {
    const controller = new FieldController({ ...config, defaultValue: null }, 'adminMeta');
    const value = controller.getDefaultValue({});
    expect(value).toEqual(null);
  });

  test('Default defined as a string', () => {
    const controller = new FieldController({ ...config, defaultValue: 'default' }, 'adminMeta');
    const value = controller.getDefaultValue({});
    expect(value).toEqual('default');
  });

  describe('default as a function', () => {
    test('function is executed', () => {
      const controller = new FieldController(
        { ...config, defaultValue: () => 'default' },
        'adminMeta'
      );
      const value = controller.getDefaultValue({});
      expect(value).toEqual('default');
    });

    test('receives expected paramaters', () => {
      const originalInput = {};
      const prefill = {};
      const defaultValue = jest.fn(() => 'default');
      const controller = new FieldController({ ...config, defaultValue }, 'adminMeta');
      controller.getDefaultValue({ originalInput, prefill });
      expect(defaultValue).toHaveBeenCalledWith({ originalInput, prefill });
    });
  });
});
