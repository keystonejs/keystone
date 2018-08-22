const tokenizerFactory = require('./relationship');

describe('Relationship tokenizer', () => {
  test('Uses correct conditions', () => {
    const relationshipConditions = { name: () => ({ foo: 'bar' }) };
    const getRelationshipQueryConditions = jest.fn(() => relationshipConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({ getRelationshipQueryConditions }));

    const relationship = tokenizerFactory({
      getRelatedListAdapterFromQueryPath,
    });

    expect(relationship({ name: 'hi' }, 'name', ['name'])).toMatchObject({ foo: 'bar' });
    expect(getRelationshipQueryConditions).toHaveBeenCalledTimes(1);
  });

  test('returns empty array when no matches found', () => {
    const relationshipConditions = { notinuse: () => ({ foo: 'bar' }) };
    const getRelationshipQueryConditions = jest.fn(() => relationshipConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({ getRelationshipQueryConditions }));

    const relationship = tokenizerFactory({
      getRelatedListAdapterFromQueryPath,
    });

    const result = relationship({ name: 'hi' }, 'name', ['name']);
    expect(result).toMatchObject({});
    expect(getRelationshipQueryConditions).toHaveBeenCalledTimes(1);
  });

  test('calls condition function with correct parameters', () => {
    const nameConditions = jest.fn(() => ({ foo: 'bar' }));
    const relationshipConditions = { name: nameConditions };
    const getRelationshipQueryConditions = jest.fn(() => relationshipConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({ getRelationshipQueryConditions }));

    const relationship = tokenizerFactory({
      getRelatedListAdapterFromQueryPath,
    });

    expect(relationship({ name: 'hi' }, 'name', ['name'], 'abc123')).toMatchObject({ foo: 'bar' });
    expect(getRelationshipQueryConditions).toHaveBeenCalledTimes(1);
    expect(nameConditions).toHaveBeenCalledTimes(1);
    expect(nameConditions).toHaveBeenCalledWith('hi', { name: 'hi' }, 'abc123');
  });
});
