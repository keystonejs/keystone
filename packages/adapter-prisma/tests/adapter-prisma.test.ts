import { PrismaAdapter } from '..';

// @ts-ignore
global.console = {
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

describe('Prisma Adapter', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('throws when database cannot be found using connection string', async () => {
    const testAdapter = new PrismaAdapter({ url: 'postgres://localhost/undefined_database' });
    const result = await testAdapter.connect({ rels: [] }).catch(result => result);

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
    const result = await testAdapter.connect({ rels: [] }).catch(result => result);

    expect(result).toBeInstanceOf(Error);
    expect(global.console.error).toHaveBeenCalledWith(
      "Could not connect to database: 'undefined_database'"
    );
  });
});
