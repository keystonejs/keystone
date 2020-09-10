const { getRelatedListAdapterFromQueryPath } = require('../lib/tokenizers');

describe('Relationship Path parser', () => {
  describe('paths', () => {
    test('Handles simple paths correctly', () => {
      const fieldAdapters = [
        {
          path: 'bar',
          isRelationship: true,
          getListByKey: jest.fn(() => ({ adapter: barListAdapter })),
        },
        {
          path: 'zip',
          isRelationship: true,
          getListByKey: jest.fn(() => ({ adapter: zipListAdapter })),
        },
      ];

      const fooListAdapter = { fieldAdapters };
      const barListAdapter = { fieldAdapters };
      const zipListAdapter = { fieldAdapters: [] };

      expect(getRelatedListAdapterFromQueryPath(fooListAdapter, ['bar', 'zip', 'ignore'])).toEqual(
        zipListAdapter
      );
    });

    test('Handles circular paths correctly', () => {
      const fieldAdapter = {
        path: 'foo',
        isRelationship: true,
        getListByKey: jest.fn(() => ({ adapter: listAdapter })),
      };
      const listAdapter = { fieldAdapters: [fieldAdapter] };

      expect(
        getRelatedListAdapterFromQueryPath(listAdapter, ['foo', 'foo', 'foo', 'ignore'])
      ).toEqual(listAdapter);
    });

    test('Handles arbitrary path strings correctly', () => {
      const fieldAdapters = [
        {
          path: 'bar_koodle',
          isRelationship: true,
          getListByKey: jest.fn(() => ({ adapter: barListAdapter })),
        },
        {
          path: 'zip-boom_zap',
          isRelationship: true,
          getListByKey: jest.fn(() => ({ adapter: zipListAdapter })),
        },
      ];

      const fooListAdapter = { fieldAdapters };
      const barListAdapter = { fieldAdapters };
      const zipListAdapter = { fieldAdapters: [] };

      expect(
        getRelatedListAdapterFromQueryPath(fooListAdapter, ['bar_koodle', 'zip-boom_zap', 'ignore'])
      ).toEqual(zipListAdapter);
    });

    test('Handles paths with AND correctly', () => {
      const fieldAdapters = [
        {
          path: 'bar_koodle',
          isRelationship: true,
          getListByKey: jest.fn(() => ({ adapter: barListAdapter })),
        },
        {
          path: 'zip-boom_zap',
          isRelationship: true,
          getListByKey: jest.fn(() => ({ adapter: zipListAdapter })),
        },
      ];

      const fooListAdapter = { fieldAdapters };
      const barListAdapter = { fieldAdapters };
      const zipListAdapter = { fieldAdapters: [] };

      expect(
        getRelatedListAdapterFromQueryPath(fooListAdapter, [
          'bar_koodle',
          'AND',
          1,
          'zip-boom_zap',
          'ignore',
        ])
      ).toEqual(zipListAdapter);
    });

    test('Handles paths with OR correctly', () => {
      const fieldAdapters = [
        {
          path: 'bar_koodle',
          isRelationship: true,
          getListByKey: jest.fn(() => ({ adapter: barListAdapter })),
        },
        {
          path: 'zip-boom_zap',
          isRelationship: true,
          getListByKey: jest.fn(() => ({ adapter: zipListAdapter })),
        },
      ];

      const fooListAdapter = { fieldAdapters };
      const barListAdapter = { fieldAdapters };
      const zipListAdapter = { fieldAdapters: [] };

      expect(
        getRelatedListAdapterFromQueryPath(fooListAdapter, [
          'bar_koodle',
          'OR',
          1,
          'zip-boom_zap',
          'ignore',
        ])
      ).toEqual(zipListAdapter);
    });
  });

  describe('errors', () => {
    test('Throws error when field not found', () => {
      const fieldAdapters = [
        // NOTE: bar_koodle is missing to make the test fail
        {
          path: 'zip-boom_zap',
          isRelationship: true,
          getListByKey: jest.fn(() => ({ adapter: zipListAdapter })),
        },
      ];

      const fooListAdapter = { key: 'foo', fieldAdapters };
      const zipListAdapter = { fieldAdapters: [] };

      expect(() =>
        getRelatedListAdapterFromQueryPath(fooListAdapter, ['bar_koodle', 'zip-boom_zap', 'ignore'])
      ).toThrow(
        /'foo' Mongo List Adapter failed to determine field responsible for the query condition 'bar_koodle'/
      );
    });
  });
});
