const { relationshipTokenizer } = require('../lib/tokenizers');

describe('Relationship tokenizer', () => {
  test('Uses correct conditions', () => {
    const relationshipConditions = {
      getRefListAdapter: () => ({ model: { collection: { name: 'name' } } }),
      field: { many: false },
      path: 'name',
    };
    const findFieldAdapterForQuerySegment = jest.fn(() => relationshipConditions);
    const listAdapter = { findFieldAdapterForQuerySegment };

    expect(relationshipTokenizer(listAdapter, 'name', ['name'], 'abc123')).toMatchObject({
      matchTerm: { $expr: { $eq: [{ $size: '$abc123_name' }, 1] } },
      relationshipInfo: {
        field: 'name',
        from: 'name',
        many: false,
        uniqueField: 'abc123_name',
      },
    });
    expect(findFieldAdapterForQuerySegment).toHaveBeenCalledTimes(1);
  });

  test('returns empty array when no matches found', () => {
    const findFieldAdapterForQuerySegment = jest.fn(() => {});
    const listAdapter = { findFieldAdapterForQuerySegment };

    const result = relationshipTokenizer(listAdapter, 'name', ['name']);
    expect(result).toMatchObject({});
    expect(findFieldAdapterForQuerySegment).toHaveBeenCalledTimes(1);
  });
});
