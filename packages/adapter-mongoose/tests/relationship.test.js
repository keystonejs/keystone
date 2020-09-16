const { relationshipTokenizer } = require('../lib/tokenizers');

describe('Relationship tokenizer', () => {
  test('Uses correct conditions', () => {
    const relationshipConditions = {
      isRelationship: true,
      getListByKey: () => ({ adapter: { key: 'Bar', model: { collection: { name: 'name' } } } }),
      field: { many: false },
      path: 'name',
      rel: {},
    };
    const listAdapter = { key: 'Foo', fieldAdapters: [relationshipConditions] };

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
  });

  test('returns empty array when no matches found', () => {
    const listAdapter = { fieldAdapters: [] };

    const result = relationshipTokenizer(listAdapter, 'name', ['name'], () => {});
    expect(result).toMatchObject({});
  });
});
