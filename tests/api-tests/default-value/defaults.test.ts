import { ProviderName, testConfig } from '@keystone-next/test-utils-legacy';
import { text } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';
import type { BaseFields } from '@keystone-next/types';

const setupList = (provider: ProviderName, fields: BaseFields<any>) => () =>
  setupFromConfig({
    provider,
    config: testConfig({
      lists: createSchema({
        User: list({ fields }),
      }),
    }),
  });

describe('defaultValue field config', () => {
  multiAdapterRunners().map(({ runner, provider }) =>
    describe(`Provider: ${provider}`, () => {
      test(
        'Has no default by default',
        runner(setupList(provider, { name: text() }), async ({ context }) => {
          const result = await context.lists.User.createOne({ data: {}, query: 'name' });
          expect(result).toMatchObject({ name: null });
        })
      );

      test(
        'Sets undefined as a default',
        runner(
          setupList(provider, { name: text({ defaultValue: undefined }) }),
          async ({ context }) => {
            const result = await context.lists.User.createOne({ data: {}, query: 'name' });
            expect(result).toMatchObject({ name: null });
          }
        )
      );

      test(
        'Sets null as a default',
        runner(setupList(provider, { name: text({ defaultValue: null }) }), async ({ context }) => {
          const result = await context.lists.User.createOne({ data: {}, query: 'name' });
          expect(result).toMatchObject({ name: null });
        })
      );

      test(
        'Sets a scalar as a default',
        runner(
          setupList(provider, { name: text({ defaultValue: 'hello' }) }),
          async ({ context }) => {
            const result = await context.lists.User.createOne({ data: {}, query: 'name' });
            expect(result).toMatchObject({ name: 'hello' });
          }
        )
      );

      test(
        'executes a function to get default',
        runner(
          setupList(provider, { name: text({ defaultValue: () => 'foobar' }) }),
          async ({ context }) => {
            const result = await context.lists.User.createOne({ data: {}, query: 'name' });
            expect(result).toMatchObject({ name: 'foobar' });
          }
        )
      );

      test(
        'handles promises returned from function',
        runner(
          setupList(provider, {
            name: text({ defaultValue: () => Promise.resolve('zippity') }),
          }),
          async ({ context }) => {
            const result = await context.lists.User.createOne({ data: {}, query: 'name' });
            expect(result).toMatchObject({ name: 'zippity' });
          }
        )
      );

      test('executes the function with the correct parameters', () => {
        const defaultValue = jest.fn();
        return runner(
          setupList(provider, { name: text({ defaultValue }) }),
          async ({ context }) => {
            await context.lists.User.createOne({ data: {} });
            expect(defaultValue).toHaveBeenCalledTimes(1);
            expect(defaultValue).toHaveBeenCalledWith(
              expect.objectContaining({
                context: expect.any(Object),
                originalInput: expect.any(Object),
              })
            );
          }
        )();
      });

      test('passes the originalInput', () => {
        const defaultValue = jest.fn(({ originalInput }) => `${originalInput.salutation} X`);
        return runner(
          setupList(provider, {
            name: text({ defaultValue }),
            salutation: text(),
          }),
          async ({ context }) => {
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
          }
        )();
      });
    })
  );
});
