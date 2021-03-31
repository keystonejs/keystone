import { AdapterName, testConfig } from '@keystone-next/test-utils-legacy';
import { createItem } from '@keystone-next/server-side-graphql-client-legacy';
import { text } from '@keystone-next/fields';
import { createSchema, list } from '@keystone-next/keystone/schema';
import { multiAdapterRunners, setupFromConfig } from '@keystone-next/test-utils-legacy';
import type { BaseFields } from '@keystone-next/types';

const setupList = (adapterName: AdapterName, fields: BaseFields<any>) => () =>
  setupFromConfig({
    adapterName,
    config: testConfig({
      lists: createSchema({
        User: list({ fields }),
      }),
    }),
  });

describe('defaultValue field config', () => {
  multiAdapterRunners().map(({ runner, adapterName }) =>
    describe(`Adapter: ${adapterName}`, () => {
      test(
        'Has no default by default',
        runner(setupList(adapterName, { name: text() }), async ({ context }) => {
          const listKey = 'User';
          const result = await createItem({ context, listKey, item: {}, returnFields: 'name' });
          expect(result).toMatchObject({ name: null });
        })
      );

      test(
        'Sets undefined as a default',
        runner(
          setupList(adapterName, { name: text({ defaultValue: undefined }) }),
          async ({ context }) => {
            const listKey = 'User';
            const result = await createItem({ context, listKey, item: {}, returnFields: 'name' });
            expect(result).toMatchObject({ name: null });
          }
        )
      );

      test(
        'Sets null as a default',
        runner(
          setupList(adapterName, { name: text({ defaultValue: null }) }),
          async ({ context }) => {
            const listKey = 'User';
            const result = await createItem({ context, listKey, item: {}, returnFields: 'name' });
            expect(result).toMatchObject({ name: null });
          }
        )
      );

      test(
        'Sets a scalar as a default',
        runner(
          setupList(adapterName, { name: text({ defaultValue: 'hello' }) }),
          async ({ context }) => {
            const listKey = 'User';
            const result = await createItem({ context, listKey, item: {}, returnFields: 'name' });
            expect(result).toMatchObject({ name: 'hello' });
          }
        )
      );

      test(
        'executes a function to get default',
        runner(
          setupList(adapterName, { name: text({ defaultValue: () => 'foobar' }) }),
          async ({ context }) => {
            const listKey = 'User';
            const result = await createItem({ context, listKey, item: {}, returnFields: 'name' });
            expect(result).toMatchObject({ name: 'foobar' });
          }
        )
      );

      test(
        'handles promises returned from function',
        runner(
          setupList(adapterName, {
            name: text({ defaultValue: () => Promise.resolve('zippity') }),
          }),
          async ({ context }) => {
            const listKey = 'User';
            const result = await createItem({ context, listKey, item: {}, returnFields: 'name' });
            expect(result).toMatchObject({ name: 'zippity' });
          }
        )
      );

      test('executes the function with the correct parameters', () => {
        const defaultValue = jest.fn();
        return runner(
          setupList(adapterName, { name: text({ defaultValue }) }),
          async ({ context }) => {
            await createItem({ context, listKey: 'User', item: {} });
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
          setupList(adapterName, {
            name: text({ defaultValue }),
            salutation: text(),
          }),
          async ({ context }) => {
            const item = { salutation: 'Doctor' };
            const listKey = 'User';
            const result = await createItem({ context, listKey, item, returnFields: 'name' });
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
