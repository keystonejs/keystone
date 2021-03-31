const { PrismaAdapter } = require('..');

global.console = {
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

describe('Prisma Adapter', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('throws when database cannot be found using connection string', async () => {
    const testAdapter = new PrismaAdapter({ url: 'postgres://localhost/undefined_database' });
    const result = await testAdapter._connect().catch(result => result);

    expect(result).toBeInstanceOf(Error);
    expect(global.console.error).toHaveBeenCalledWith(
      "Could not connect to database: 'undefined_database'"
    );
  });

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('throws when database cannot be found using connection object', async () => {
    const testAdapter = new PrismaAdapter({
      url: 'postgres://your_database_user:your_database_password@127.0.0.1/undefined_database',
    });
    const result = await testAdapter._connect().catch(result => result);

    expect(result).toBeInstanceOf(Error);
    expect(global.console.error).toHaveBeenCalledWith(
      "Could not connect to database: 'undefined_database'"
    );
  });

  describe('checkDatabaseVersion', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('throws when database version is unsupported', async () => {
      const testAdapter = new PrismaAdapter();
      await testAdapter._connect();
      testAdapter.minVer = '50.5.5';
      const result = await testAdapter.checkDatabaseVersion().catch(result => result);
      expect(result).toBeInstanceOf(Error);
      testAdapter.disconnect();
    });

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('does not throw when database version is supported', async () => {
      const testAdapter = new PrismaAdapter();
      await testAdapter._connect();
      testAdapter.minVer = '1.0.0';
      const result = await testAdapter.checkDatabaseVersion().catch(result => result);
      expect(result).not.toBeInstanceOf(Error);
      testAdapter.disconnect();
    });
  });
});
