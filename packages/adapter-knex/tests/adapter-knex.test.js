const { KnexAdapter } = require('../lib/adapter-knex');

// global.console = {
//   error: jest.fn(),
//   warn: jest.fn(),
//   log: jest.fn(),
// };

describe('Knex Adapter', () => {
  const testAdapter = new KnexAdapter();
  test('throws when database cannot be found', async () => {
    const result = await testAdapter
      ._connect({ name: 'undefined-database' })
      .catch(result => result);
    // The console mock is not working on CI todo: resolve this
    // expect(global.console.error).toHaveBeenCalledWith(
    //   "Could not connect to database: 'postgres://localhost/undefined_database'"
    // );
    expect(result).toBeInstanceOf(Error);
  });
});
