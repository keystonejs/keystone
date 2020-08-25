const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
import { createItem, getItem, getItems, updateItem } from '@keystonejs/server-side-graphql-client';
import { Unsplash } from './';

export const name = 'Unsplash';
export { Unsplash as type };
export const supportsUnique = false;
export const skipRequiredTest = false;
export const exampleValue = 'U0tBTn8UR8I';
export const exampleValue2 = 'xrVDYZRGdw4';
export const fieldConfig = {
  accessKey: process.env.UNSPLASH_KEY,
  secretKey: process.env.UNSPLASH_SECRET,
};

export const getTestFields = () => {
  return {
    name: { type: String },
    heroImage: {
      type: Unsplash,
      accessKey: process.env.UNSPLASH_KEY,
      secretKey: process.env.UNSPLASH_SECRET,
    },
  };
};

export const initItems = () => {
  return [
    { name: 'a', heroImage: 'dYEuFB8KQJk' },
    { name: 'b', heroImage: '95YRwf6CNw8' },
    { name: 'c', heroImage: null },
    { name: 'd' },
  ];
};

export const filterTests = withKeystone => {
  const match = async (keystone, where, expected, sortBy = 'name_ASC') =>
    expect(
      await getItems({
        keystone,
        listKey: 'test',
        where,
        returnFields: 'name heroImage { unsplashId }',
        sortBy,
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'a', heroImage: { unsplashId: 'dYEuFB8KQJk' } },
        { name: 'b', heroImage: { unsplashId: '95YRwf6CNw8' } },
        { name: 'c', heroImage: null },
        { name: 'd', heroImage: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'a', heroImage: { unsplashId: 'dYEuFB8KQJk' } },
        { name: 'b', heroImage: { unsplashId: '95YRwf6CNw8' } },
        { name: 'c', heroImage: null },
        { name: 'd', heroImage: null },
      ])
    )
  );

  test(
    'Filter: heroImage_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { heroImage_not: null }, [
        { name: 'a', heroImage: { unsplashId: 'dYEuFB8KQJk' } },
        { name: 'b', heroImage: { unsplashId: '95YRwf6CNw8' } },
      ])
    )
  );

  test(
    'Filter: heroImage_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { heroImage_not_in: [null] }, [
        { name: 'a', heroImage: { unsplashId: 'dYEuFB8KQJk' } },
        { name: 'b', heroImage: { unsplashId: '95YRwf6CNw8' } },
      ])
    )
  );

  test(
    'Filter: heroImage_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { heroImage_in: [] }, []))
  );

  test(
    'Filter: heroImage_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { heroImage_not_in: [] }, [
        { name: 'a', heroImage: { unsplashId: 'dYEuFB8KQJk' } },
        { name: 'b', heroImage: { unsplashId: '95YRwf6CNw8' } },
        { name: 'c', heroImage: null },
        { name: 'd', heroImage: null },
      ])
    )
  );
};

export const crudTests = withKeystone => {
  const withHelpers = wrappedFn => {
    return async ({ keystone, listKey }) => {
      const items = await getItems({
        keystone,
        listKey,
        returnFields: 'id heroImage { unsplashId }',
        sortBy: 'name_ASC',
      });

      return wrappedFn({ keystone, listKey, items });
    };
  };

  test(
    'Create',
    withKeystone(
      withHelpers(async ({ keystone, listKey }) => {
        const data = await createItem({
          keystone,
          listKey,
          item: { name: 'Keystone loves React', heroImage: 'JdoofvUDUwc' },
          returnFields: 'id heroImage { unsplashId }',
        });
        expect(data).not.toBe(null);
        expect(data.heroImage.unsplashId).toEqual('JdoofvUDUwc');
      })
    )
  );

  test(
    'Read',
    withKeystone(
      withHelpers(async ({ keystone, listKey, items }) => {
        const data = await getItem({
          keystone,
          listKey,
          itemId: items[0].id,
          returnFields: 'id heroImage { unsplashId }',
        });

        expect(data).not.toBe(null);
        expect(data.heroImage.unsplashId).toBe(items[0].heroImage.unsplashId);
      })
    )
  );

  describe('Update', () => {
    test(
      'Updating the value',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { heroImage: '1LLh8k2_YFk' },
            },
            returnFields: 'heroImage { unsplashId }',
          });
          expect(data).not.toBe(null);
          expect(data.heroImage.unsplashId).toBe('1LLh8k2_YFk');
        })
      )
    );

    test(
      'Updating the value to null',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[3].id,
              data: { heroImage: null },
            },
            returnFields: 'heroImage',
          });
          expect(data).not.toBe(null);
          expect(data.heroImage).toBe(null);
        })
      )
    );

    test(
      'Updating without this field',
      withKeystone(
        withHelpers(async ({ keystone, items, listKey }) => {
          const data = await updateItem({
            keystone,
            listKey,
            item: {
              id: items[0].id,
              data: { name: 'Keystone User Guide' },
            },
            returnFields: 'name heroImage { unsplashId }',
          });
          expect(data).not.toBe(null);
          expect(data.name).toBe('Keystone User Guide');
          expect(data.heroImage.unsplashId).toBe(items[0].heroImage.unsplashId);
        })
      )
    );
  });
};
