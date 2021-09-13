import { text } from '@keystone-next/keystone/fields';
import { list } from '@keystone-next/keystone';
import { setupTestRunner } from '@keystone-next/keystone/testing';
import type { BaseFields } from '@keystone-next/keystone/types';
import { apiTestConfig } from '../utils';

const setupList = (fields: BaseFields<any>) =>
  setupTestRunner({ config: apiTestConfig({ lists: { User: list({ fields }) } }) });

describe('defaultValue field config', () => {
  test(
    'Has no default by default',
    setupList({ name: text() })(async ({ context }) => {
      const result = await context.lists.User.createOne({ data: {}, query: 'name' });
      expect(result).toMatchObject({ name: null });
    })
  );

  test(
    'Sets undefined as a default',
    setupList({ name: text({ defaultValue: undefined }) })(async ({ context }) => {
      const result = await context.lists.User.createOne({ data: {}, query: 'name' });
      expect(result).toMatchObject({ name: null });
    })
  );

  test(
    'Sets null as a default',
    setupList({ name: text({ defaultValue: null }) })(async ({ context }) => {
      const result = await context.lists.User.createOne({ data: {}, query: 'name' });
      expect(result).toMatchObject({ name: null });
    })
  );

  test(
    'Sets a scalar as a default',
    setupList({ name: text({ defaultValue: 'hello' }) })(async ({ context }) => {
      const result = await context.lists.User.createOne({ data: {}, query: 'name' });
      expect(result).toMatchObject({ name: 'hello' });
    })
  );

  test(
    'executes a function to get default',
    setupList({ name: text({ defaultValue: () => 'foobar' }) })(async ({ context }) => {
      const result = await context.lists.User.createOne({ data: {}, query: 'name' });
      expect(result).toMatchObject({ name: 'foobar' });
    })
  );

  test(
    'handles promises returned from function',
    setupList({ name: text({ defaultValue: () => Promise.resolve('zippity') }) })(
      async ({ context }) => {
        const result = await context.lists.User.createOne({ data: {}, query: 'name' });
        expect(result).toMatchObject({ name: 'zippity' });
      }
    )
  );

  test('executes the function with the correct parameters', () => {
    const defaultValue = jest.fn();
    return setupList({ name: text({ defaultValue }) })(async ({ context }) => {
      await context.lists.User.createOne({ data: {} });
      expect(defaultValue).toHaveBeenCalledTimes(1);
      expect(defaultValue).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.any(Object),
          originalInput: expect.any(Object),
        })
      );
    })();
  });

  test('passes the originalInput', () => {
    const defaultValue = jest.fn(({ originalInput }) => `${originalInput.salutation} X`);
    return setupList({ name: text({ defaultValue }), salutation: text() })(async ({ context }) => {
      const data = { salutation: 'Doctor' };
      const result = await context.lists.User.createOne({ data, query: 'name' });
      expect(defaultValue).toHaveBeenCalledTimes(1);
      expect(defaultValue).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.any(Object),
          originalInput: { salutation: 'Doctor' },
        })
      );
      expect(result).toMatchObject({ name: 'Doctor X' });
    })();
  });
});
