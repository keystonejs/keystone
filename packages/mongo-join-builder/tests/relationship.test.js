const { relationshipTokenizer } = require('../lib/tokenizers');

describe('Relationship tokenizer', () => {
  test('Uses correct conditions', () => {
    const relationshipConditions = {
      getRefListAdapter: () => ({ key: 'Bar', model: { collection: { name: 'name' } } }),
      field: { many: false },
      path: 'name',
      rel: {},
    };
    const findFieldAdapterForQuerySegment = jest.fn(() => relationshipConditions);
    const listAdapter = { findFieldAdapterForQuerySegment, key: 'Foo' };

    expect(relationshipTokenizer(listAdapter, 'name', ['name'], () => 'abc123')).toMatchObject({
      matchTerm: { $expr: { $eq: [{ $size: '$abc123_name' }, 1] } },
      relationshipInfo: {
        from: 'name',
        thisTable: 'Foo',
        rel: {},
        filterType: 'only',
        uniqueField: 'abc123_name',
        farCollection: 'name',
      },
    });
    expect(findFieldAdapterForQuerySegment).toHaveBeenCalledTimes(1);
  });

  test('returns empty array when no matches found', () => {
    const findFieldAdapterForQuerySegment = jest.fn(() => {});
    const listAdapter = { findFieldAdapterForQuerySegment };

    const result = relationshipTokenizer(listAdapter, 'name', ['name'], () => {});
    expect(result).toMatchObject({});
    expect(findFieldAdapterForQuerySegment).toHaveBeenCalledTimes(1);
  });
});
