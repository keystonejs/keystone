const { PrismaAdapter } = require('../lib/adapter-prisma');

global.console = {
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

describe('Prisma Adapter', () => {
  test.skip('throws when database cannot be found using connection string', async () => {
    const testAdapter = new PrismaAdapter({
      knexOptions: { connection: 'postgres://localhost/undefined_database' },
    });
    const result = await testAdapter._connect().catch(result => result);

    expect(result).toBeInstanceOf(Error);
    expect(global.console.error).toHaveBeenCalledWith(
      "Could not connect to database: 'undefined_database'"
    );
  });

  test.skip('throws when database cannot be found using connection object', async () => {
    const testAdapter = new PrismaAdapter({
      knexOptions: {
        connection: {
          host: '127.0.0.1',
          user: 'your_database_user',
          password: 'your_database_password',
          database: 'undefined_database',
        },
      },
    });
    const result = await testAdapter._connect().catch(result => result);

    expect(result).toBeInstanceOf(Error);
    expect(global.console.error).toHaveBeenCalledWith(
      "Could not connect to database: 'undefined_database'"
    );
  });

  describe('checkDatabaseVersion', () => {
    test.skip('throws when database version is unsupported', async () => {
      const testAdapter = new PrismaAdapter();
      await testAdapter._connect();
      testAdapter.minVer = '50.5.5';
      const result = await testAdapter.checkDatabaseVersion().catch(result => result);
      expect(result).toBeInstanceOf(Error);
      testAdapter.disconnect();
    });

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
