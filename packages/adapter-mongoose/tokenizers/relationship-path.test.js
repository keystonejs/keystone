const getRelatedListAdapterFromQueryPathFactory = require('./relationship-path');

describe('Relationship Path parser', () => {
  describe('factory function', () => {
    test('returns a function', () => {
      expect(getRelatedListAdapterFromQueryPathFactory({})).toEqual(expect.any(Function));
    });

    test('Throws if no list adapter provided', () => {
      expect(() => getRelatedListAdapterFromQueryPathFactory()).toThrow(
        /Must provide a list adapter instance/
      );
    });
  });

  describe('paths', () => {
    test('Handles simple paths correctly', () => {
      let fooListAdapter;
      let barListAdapter;
      let zipListAdapter;

      const fieldAdapters = {
        bar: { getRefListAdapter: jest.fn(() => barListAdapter) },
        zip: { getRefListAdapter: jest.fn(() => zipListAdapter) },
      };

      fooListAdapter = { getFieldAdapterByQueryConditionKey: jest.fn(key => fieldAdapters[key]) };
      barListAdapter = { getFieldAdapterByQueryConditionKey: jest.fn(key => fieldAdapters[key]) };
      zipListAdapter = {};

      const getlistAdapter = getRelatedListAdapterFromQueryPathFactory(fooListAdapter);
      expect(getlistAdapter(['bar', 'zip'])).toEqual(zipListAdapter);
    });

    test('Handles circular paths correctly', () => {
      let listAdapter;
      const fieldAdapter = { getRefListAdapter: jest.fn(() => listAdapter) };
      listAdapter = { getFieldAdapterByQueryConditionKey: jest.fn(() => fieldAdapter) };

      const getlistAdapter = getRelatedListAdapterFromQueryPathFactory(listAdapter);
      expect(getlistAdapter(['foo', 'foo', 'foo'])).toEqual(listAdapter);
    });

    test('Handles arbitrary path strings correctly', () => {
      let fooListAdapter;
      let barListAdapter;
      let zipListAdapter;

      const fieldAdapters = {
        bar_koodle: { getRefListAdapter: jest.fn(() => barListAdapter) },
        'zip-boom_zap': { getRefListAdapter: jest.fn(() => zipListAdapter) },
      };

      fooListAdapter = { getFieldAdapterByQueryConditionKey: jest.fn(key => fieldAdapters[key]) };
      barListAdapter = { getFieldAdapterByQueryConditionKey: jest.fn(key => fieldAdapters[key]) };
      zipListAdapter = {};

      const getlistAdapter = getRelatedListAdapterFromQueryPathFactory(fooListAdapter);
      expect(getlistAdapter(['bar_koodle', 'zip-boom_zap'])).toEqual(zipListAdapter);
    });

    test('Handles paths with AND correctly', () => {
      let fooListAdapter;
      let barListAdapter;
      let zipListAdapter;

      const fieldAdapters = {
        bar_koodle: { getRefListAdapter: jest.fn(() => barListAdapter) },
        'zip-boom_zap': { getRefListAdapter: jest.fn(() => zipListAdapter) },
      };

      fooListAdapter = { getFieldAdapterByQueryConditionKey: jest.fn(key => fieldAdapters[key]) };
      barListAdapter = { getFieldAdapterByQueryConditionKey: jest.fn(key => fieldAdapters[key]) };
      zipListAdapter = {};

      const getlistAdapter = getRelatedListAdapterFromQueryPathFactory(fooListAdapter);
      expect(getlistAdapter(['bar_koodle', 'AND', 1, 'zip-boom_zap'])).toEqual(zipListAdapter);
    });

    test('Handles paths with OR correctly', () => {
      let fooListAdapter;
      let barListAdapter;
      let zipListAdapter;

      const fieldAdapters = {
        bar_koodle: { getRefListAdapter: jest.fn(() => barListAdapter) },
        'zip-boom_zap': { getRefListAdapter: jest.fn(() => zipListAdapter) },
      };

      fooListAdapter = { getFieldAdapterByQueryConditionKey: jest.fn(key => fieldAdapters[key]) };
      barListAdapter = { getFieldAdapterByQueryConditionKey: jest.fn(key => fieldAdapters[key]) };
      zipListAdapter = {};

      const getlistAdapter = getRelatedListAdapterFromQueryPathFactory(fooListAdapter);
      expect(getlistAdapter(['bar_koodle', 'OR', 1, 'zip-boom_zap'])).toEqual(zipListAdapter);
    });
  });

  describe('errors', () => {
    test('Throws error when field not found', () => {
      let fooListAdapter;
      let zipListAdapter;

      const fieldAdapters = {
        // NOTE: bar_koodle is missing to make the test fail
        'zip-boom_zap': { getRefListAdapter: jest.fn(() => zipListAdapter) },
      };

      fooListAdapter = {
        key: 'foo',
        getFieldAdapterByQueryConditionKey: jest.fn(key => fieldAdapters[key]),
      };
      zipListAdapter = {};

      const getlistAdapter = getRelatedListAdapterFromQueryPathFactory(fooListAdapter);
      expect(() => getlistAdapter(['bar_koodle', 'zip-boom_zap'])).toThrow(
        /'foo' Mongo List Adapter failed to determine field responsible for the query condition 'bar_koodle'/
      );
    });
  });
});
