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

    expect(
      relationshipTokenizer(listAdapter, { name: 'hi' }, 'name', ['name'], 'abc123')
    ).toMatchObject({
      matchTerm: { abc123_name_every: true },
      relationshipInfo: {
        field: 'name',
        from: 'name',
        many: false,
      },
    });
    expect(findFieldAdapterForQuerySegment).toHaveBeenCalledTimes(1);
  });

  test('returns empty array when no matches found', () => {
    const findFieldAdapterForQuerySegment = jest.fn(() => {});
    const listAdapter = { findFieldAdapterForQuerySegment };

    const result = relationshipTokenizer(listAdapter, { name: 'hi' }, 'name', ['name']);
    expect(result).toMatchObject({});
    expect(findFieldAdapterForQuerySegment).toHaveBeenCalledTimes(1);
  });
});
