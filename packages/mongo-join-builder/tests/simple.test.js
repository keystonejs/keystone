const { simpleTokenizer } = require('../lib/tokenizers/simple');

describe('Simple tokenizer', () => {
  test('Uses correct conditions', () => {
    const simpleConditions = { name: () => ({ foo: 'bar' }) };
    const getQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({
      fieldAdapters: [{ getQueryConditions }],
    }));

    const simple = simpleTokenizer({ getRelatedListAdapterFromQueryPath });

    expect(simple({ name: 'hi' }, 'name', ['name'])).toMatchObject({
      matchTerm: { foo: 'bar' },
    });
    expect(getQueryConditions).toHaveBeenCalledTimes(1);
  });

  test('Falls back to modifier conditions when no simple condition found', () => {
    const simpleConditions = { notinuse: () => ({ foo: 'bar' }) };
    const getQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({
      fieldAdapters: [{ getQueryConditions }],
    }));

    const simple = simpleTokenizer({ getRelatedListAdapterFromQueryPath });

    expect(simple({ $count: 'hi' }, '$count', ['$count'])).toMatchObject({
      postJoinPipeline: [{ $count: 'hi' }],
    });
    expect(getQueryConditions).toHaveBeenCalledTimes(1);
  });

  test('returns empty array when no matches found', () => {
    const simpleConditions = { notinuse: () => ({ foo: 'bar' }) };
    const getQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({
      fieldAdapters: [{ getQueryConditions }],
    }));

    const simple = simpleTokenizer({ getRelatedListAdapterFromQueryPath });

    const result = simple({ name: 'hi' }, 'name', ['name']);
    expect(result).toMatchObject({});
    expect(getQueryConditions).toHaveBeenCalledTimes(1);
  });

  test('calls condition function with correct parameters', () => {
    const nameConditions = jest.fn(() => ({ foo: 'bar' }));
    const simpleConditions = { name: nameConditions };
    const getQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({
      fieldAdapters: [{ getQueryConditions }],
    }));

    const simple = simpleTokenizer({ getRelatedListAdapterFromQueryPath });

    expect(simple({ name: 'hi' }, 'name', ['name'])).toMatchObject({
      matchTerm: { foo: 'bar' },
    });
    expect(getQueryConditions).toHaveBeenCalledTimes(1);
    expect(nameConditions).toHaveBeenCalledTimes(1);
    expect(nameConditions).toHaveBeenCalledWith('hi', { name: 'hi' });
  });
});
