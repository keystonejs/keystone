const { getRelatedListAdapterFromQueryPath } = require('../lib/tokenizers/relationship-path');

describe('Relationship Path parser', () => {
  describe('paths', () => {
    test('Handles simple paths correctly', () => {
      let fooListAdapter;
      let barListAdapter;
      let zipListAdapter;

      const fieldAdapters = {
        bar: { getRefListAdapter: jest.fn(() => barListAdapter) },
        zip: { getRefListAdapter: jest.fn(() => zipListAdapter) },
      };

      fooListAdapter = { findFieldAdapterForQuerySegment: jest.fn(key => fieldAdapters[key]) };
      barListAdapter = { findFieldAdapterForQuerySegment: jest.fn(key => fieldAdapters[key]) };
      zipListAdapter = {};

      expect(getRelatedListAdapterFromQueryPath(fooListAdapter, ['bar', 'zip'])).toEqual(
        zipListAdapter
      );
    });

    test('Handles circular paths correctly', () => {
      let listAdapter;
      const fieldAdapter = { getRefListAdapter: jest.fn(() => listAdapter) };
      listAdapter = { findFieldAdapterForQuerySegment: jest.fn(() => fieldAdapter) };

      expect(getRelatedListAdapterFromQueryPath(listAdapter, ['foo', 'foo', 'foo'])).toEqual(
        listAdapter
      );
    });

    test('Handles arbitrary path strings correctly', () => {
      let fooListAdapter;
      let barListAdapter;
      let zipListAdapter;

      const fieldAdapters = {
        bar_koodle: { getRefListAdapter: jest.fn(() => barListAdapter) },
        'zip-boom_zap': { getRefListAdapter: jest.fn(() => zipListAdapter) },
      };

      fooListAdapter = { findFieldAdapterForQuerySegment: jest.fn(key => fieldAdapters[key]) };
      barListAdapter = { findFieldAdapterForQuerySegment: jest.fn(key => fieldAdapters[key]) };
      zipListAdapter = {};

      expect(
        getRelatedListAdapterFromQueryPath(fooListAdapter, ['bar_koodle', 'zip-boom_zap'])
      ).toEqual(zipListAdapter);
    });

    test('Handles paths with AND correctly', () => {
      let fooListAdapter;
      let barListAdapter;
      let zipListAdapter;

      const fieldAdapters = {
        bar_koodle: { getRefListAdapter: jest.fn(() => barListAdapter) },
        'zip-boom_zap': { getRefListAdapter: jest.fn(() => zipListAdapter) },
      };

      fooListAdapter = { findFieldAdapterForQuerySegment: jest.fn(key => fieldAdapters[key]) };
      barListAdapter = { findFieldAdapterForQuerySegment: jest.fn(key => fieldAdapters[key]) };
      zipListAdapter = {};

      expect(
        getRelatedListAdapterFromQueryPath(fooListAdapter, ['bar_koodle', 'AND', 1, 'zip-boom_zap'])
      ).toEqual(zipListAdapter);
    });

    test('Handles paths with OR correctly', () => {
      let fooListAdapter;
      let barListAdapter;
      let zipListAdapter;

      const fieldAdapters = {
        bar_koodle: { getRefListAdapter: jest.fn(() => barListAdapter) },
        'zip-boom_zap': { getRefListAdapter: jest.fn(() => zipListAdapter) },
      };

      fooListAdapter = { findFieldAdapterForQuerySegment: jest.fn(key => fieldAdapters[key]) };
      barListAdapter = { findFieldAdapterForQuerySegment: jest.fn(key => fieldAdapters[key]) };
      zipListAdapter = {};

      expect(
        getRelatedListAdapterFromQueryPath(fooListAdapter, ['bar_koodle', 'OR', 1, 'zip-boom_zap'])
      ).toEqual(zipListAdapter);
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
        findFieldAdapterForQuerySegment: jest.fn(key => fieldAdapters[key]),
      };
      zipListAdapter = {};

      expect(() =>
        getRelatedListAdapterFromQueryPath(fooListAdapter, ['bar_koodle', 'zip-boom_zap'])
      ).toThrow(
        /'foo' Mongo List Adapter failed to determine field responsible for the query condition 'bar_koodle'/
      );
    });
  });
});
