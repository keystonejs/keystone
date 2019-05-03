const mongoose = require('mongoose');
const tokenizerFactory = require('../lib/tokenizers/simple');

describe('Simple tokenizer', () => {
  test('Uses correct conditions', () => {
    const simpleConditions = { name: () => ({ foo: 'bar' }) };
    const getQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({
      fieldAdapters: [{ getQueryConditions }],
    }));

    const simple = tokenizerFactory({ getRelatedListAdapterFromQueryPath });

    expect(simple({ name: 'hi' }, 'name', ['name'])).toMatchObject({
      matchTerm: { foo: 'bar' },
    });
    expect(getQueryConditions).toHaveBeenCalledTimes(1);
  });

  test('Falls back to modifier conditions when no simple condition found', () => {
    const simpleConditions = { notinuse: () => ({ foo: 'bar' }) };
    const modifierConditions = { name: () => ({ zip: 'quux' }) };
    const getQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({
      fieldAdapters: [{ getQueryConditions }],
    }));

    const simple = tokenizerFactory({ getRelatedListAdapterFromQueryPath, modifierConditions });

    expect(simple({ name: 'hi' }, 'name', ['name'])).toMatchObject({
      postJoinPipeline: [{ zip: 'quux' }],
    });
    expect(getQueryConditions).toHaveBeenCalledTimes(1);
  });

  test('returns empty array when no matches found', () => {
    const simpleConditions = { notinuse: () => ({ foo: 'bar' }) };
    const modifierConditions = { idontexist: () => ({ zip: 'quux' }) };
    const getQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({
      fieldAdapters: [{ getQueryConditions }],
    }));

    const simple = tokenizerFactory({ getRelatedListAdapterFromQueryPath, modifierConditions });

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

    const simple = tokenizerFactory({ getRelatedListAdapterFromQueryPath });

    expect(simple({ name: 'hi' }, 'name', ['name'])).toMatchObject({
      matchTerm: { foo: 'bar' },
    });
    expect(getQueryConditions).toHaveBeenCalledTimes(1);
    expect(nameConditions).toHaveBeenCalledTimes(1);
    expect(nameConditions).toHaveBeenCalledWith('hi', { name: 'hi' });
  });

  test('Correctly handles id query keys', () => {
    const nameConditions = jest.fn(() => ({ foo: 'bar' }));
    const simpleConditions = { name: nameConditions };
    const getQueryConditions = jest.fn(() => simpleConditions);
    const getRelatedListAdapterFromQueryPath = jest.fn(() => ({
      fieldAdapters: [{ getQueryConditions }],
    }));

    const simple = tokenizerFactory({ getRelatedListAdapterFromQueryPath });

    expect(simple({ id: '123412341234' }, 'id', ['name'])).toMatchObject({
      matchTerm: { _id: { $eq: mongoose.Types.ObjectId('123412341234') } },
    });
    expect(simple({ id_not: '123412341234' }, 'id_not', ['name'])).toMatchObject({
      matchTerm: { _id: { $ne: mongoose.Types.ObjectId('123412341234') } },
    });
    expect(simple({ id_in: ['123412341234'] }, 'id_in', ['name'])).toMatchObject({
      matchTerm: { _id: { $in: [mongoose.Types.ObjectId('123412341234')] } },
    });
    expect(simple({ id_not_in: ['123412341234'] }, 'id_not_in', ['name'])).toMatchObject({
      matchTerm: { _id: { $not: { $in: [mongoose.Types.ObjectId('123412341234')] } } },
    });
  });
});
