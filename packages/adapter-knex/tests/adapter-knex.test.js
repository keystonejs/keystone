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

  describe('checkDatabaseVersion', () => {
    test('throws when database version is unsupported', async () => {
      const testAdapter = new KnexAdapter();
      await testAdapter._connect({ name: 'postgres' });
      testAdapter.minVer = '50.5.5';
      const result = await testAdapter.checkDatabaseVersion().catch(result => result);
      expect(result).toBeInstanceOf(Error);
      testAdapter.disconnect();
    });

    test('does not throw when database version is supported', async () => {
      const testAdapter = new KnexAdapter();
      await testAdapter._connect({ name: 'postgres' });
      testAdapter.minVer = '1.0.0';
      const result = await testAdapter.checkDatabaseVersion().catch(result => result);
      expect(result).not.toBeInstanceOf(Error);
      testAdapter.disconnect();
    });
  });
});
