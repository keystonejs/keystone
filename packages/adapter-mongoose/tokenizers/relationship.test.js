const tokenizerFactory = require('./relationship');

describe('Relationship tokenizer', () => {
  test('Uses correct conditions', () => {
    const getRelationshipQueryCondition = jest.fn(() => ({ foo: 'bar' }));
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({
      fieldAdapters: [
        {
          isRelationship: true,
          supportsRelationshipQuery: () => true,
          getRelationshipQueryCondition,
        },
      ],
    }));

    const relationship = tokenizerFactory({
      getRelatedListAdapterFromQueryPath,
    });

    expect(relationship({ name: 'hi' }, 'name', ['name'])).toMatchObject({ foo: 'bar' });
    expect(getRelationshipQueryCondition).toHaveBeenCalledTimes(1);
  });

  test('returns empty array when no matches found', () => {
    const relationshipConditions = { notinuse: () => ({ foo: 'bar' }) };
    const getRelationshipQueryCondition = jest.fn(() => relationshipConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({
      fieldAdapters: [
        {
          isRelationship: true,
          supportsRelationshipQuery: () => true,
          getRelationshipQueryCondition,
        },
      ],
    }));

    const relationship = tokenizerFactory({
      getRelatedListAdapterFromQueryPath,
    });

    const result = relationship({ name: 'hi' }, 'name', ['name']);
    expect(result).toMatchObject({});
    expect(getRelationshipQueryCondition).toHaveBeenCalledTimes(1);
  });

  test('calls condition function with correct parameters', () => {
    const getRelationshipQueryCondition = jest.fn(() => ({ foo: 'bar' }));
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({
      fieldAdapters: [
        {
          isRelationship: true,
          supportsRelationshipQuery: query => query === 'name',
          getRelationshipQueryCondition,
        },
      ],
    }));

    const relationship = tokenizerFactory({
      getRelatedListAdapterFromQueryPath,
    });

    expect(relationship({ name: 'hi' }, 'name', ['name'], 'abc123')).toMatchObject({ foo: 'bar' });
    expect(getRelationshipQueryCondition).toHaveBeenCalledTimes(1);
    expect(getRelationshipQueryCondition).toHaveBeenCalledWith('name', 'abc123');
  });
});
