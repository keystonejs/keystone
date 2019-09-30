const { relationshipTokenizer } = require('../lib/tokenizers/relationship');

describe('Relationship tokenizer', () => {
  test('Uses correct conditions', () => {
    const relationshipConditions = {
      getRefListAdapter: () => ({ model: { collection: { name: 'name' } } }),
      field: { many: false },
      path: 'name',
    };
    const findFieldAdapterForQuerySegment = jest.fn(() => relationshipConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({ findFieldAdapterForQuerySegment }));
    const relationship = relationshipTokenizer({ getRelatedListAdapterFromQueryPath });

    expect(relationship({ name: 'hi' }, 'name', ['name'], 'abc123')).toMatchObject({
      field: 'name',
      from: 'name',
      matchTerm: { abc123_name_every: true },
      many: false,
    });
    expect(findFieldAdapterForQuerySegment).toHaveBeenCalledTimes(1);
  });

  test('returns empty array when no matches found', () => {
    const findFieldAdapterForQuerySegment = jest.fn(() => {});
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({ findFieldAdapterForQuerySegment }));

    const relationship = relationshipTokenizer({
      getRelatedListAdapterFromQueryPath,
    });

    const result = relationship({ name: 'hi' }, 'name', ['name']);
    expect(result).toMatchObject({});
    expect(findFieldAdapterForQuerySegment).toHaveBeenCalledTimes(1);
  });
});
