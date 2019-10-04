const { KnexAdapter } = require('../lib/adapter-knex');

global.console = {
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

describe('Knex Adapter', () => {
  test('throws when database cannot be found using connection string', async () => {
    const testAdapter = new KnexAdapter({
      knexOptions: { connection: 'postgres://localhost/undefined_database' },
    });
    const result = await testAdapter
      ._connect({ name: 'undefined-database' })
      .catch(result => result);

    expect(result).toBeInstanceOf(Error);
    expect(global.console.error).toHaveBeenCalledWith(
      "Could not connect to database: 'undefined_database'"
    );
  });

  test('throws when database cannot be found using connection object', async () => {
    const testAdapter = new KnexAdapter({
      knexOptions: {
        connection: {
          host: '127.0.0.1',
          user: 'your_database_user',
          password: 'your_database_password',
          database: 'undefined_database',
        },
      },
    });
    const result = await testAdapter
      ._connect({ name: 'undefined-database' })
      .catch(result => result);

    expect(result).toBeInstanceOf(Error);
    expect(global.console.error).toHaveBeenCalledWith(
      "Could not connect to database: 'undefined_database'"
    );
  });
});
