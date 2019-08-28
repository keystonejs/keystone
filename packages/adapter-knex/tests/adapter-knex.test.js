const { KnexAdapter } = require('../lib/adapter-knex');

global.console = {
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

describe('Knex Adapter', () => {
  const testAdapter = new KnexAdapter({ connection: 'postgres://localhost/undefined_database' });
  test('throws when database cannot be found', async () => {
    const result = await testAdapter
      ._connect({ name: 'undefined-database' })
      .catch(result => result);

    // Temp logging for CI
    console.log(result);

    expect(global.console.error).toHaveBeenCalledWith(
      "Could not connect to database: 'postgres://localhost/undefined_database'"
    );
    expect(result).toBeInstanceOf(Error);
  });
});
