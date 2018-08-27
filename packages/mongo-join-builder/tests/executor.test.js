const executor = require('../executor');

describe('executor', () => {
  it('runs an aggregate query', async () => {
    const joinQuery = {};
    const aggregateResponse = [{ foo: 'bar' }];

    const mutatorResult = { fee: 'bee' };
    const mutator = jest.fn(() => mutatorResult);
    const aggregate = jest.fn(() => Promise.resolve(aggregateResponse));

    const result = await executor({
      joinQuery,
      mutator,
      aggregate,
    });

    expect(aggregate).toHaveBeenCalledWith(joinQuery);
    expect(mutator).toHaveBeenCalledWith(aggregateResponse);
    expect(result).toMatchObject(mutatorResult);
  });
});
