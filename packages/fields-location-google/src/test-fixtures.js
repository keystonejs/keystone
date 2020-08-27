// We need a valid googleMapsKey to be added to CI to make this test runnable
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import { createItem, getItem, getItems, updateItem } from '@keystonejs/server-side-graphql-client';
import { LocationGoogle } from './';

export const name = 'Location';
export { LocationGoogle as type };
export const supportsUnique = false;
export const skipRequiredTest = false;
export const exampleValue = 'ChIJOza7MD-uEmsRrf4t12uji6Y';
export const fieldConfig = {
  googleMapsKey: process.env.GOOGLE_API_KEY,
};

export const getTestFields = () => {
  return {
    name: { type: String },
    venue: {
      type: LocationGoogle,
      googleMapsKey: process.env.GOOGLE_API_KEY,
    },
  };
};

export const initItems = () => {
  return [
    { name: 'a', venue: 'ChIJOza7MD-uEmsRrf4t12uji6Y' },
    { name: 'b', venue: 'ChIJ_9gDOjmuEmsRB7WRXm_Y6o8' },
    { name: 'c', venue: null },
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
        returnFields: 'name venue { googlePlaceID }',
        sortBy,
      })
    ).toEqual(expected);

  test(
    'No filter',
    withKeystone(({ keystone }) =>
      match(keystone, undefined, [
        { name: 'a', venue: { googlePlaceID: 'ChIJOza7MD-uEmsRrf4t12uji6Y' } },
        { name: 'b', venue: { googlePlaceID: 'ChIJ_9gDOjmuEmsRB7WRXm_Y6o8' } },
        { name: 'c', venue: null },
        { name: 'd', venue: null },
      ])
    )
  );

  test(
    'Empty filter',
    withKeystone(({ keystone }) =>
      match(keystone, {}, [
        { name: 'a', venue: { googlePlaceID: 'ChIJOza7MD-uEmsRrf4t12uji6Y' } },
        { name: 'b', venue: { googlePlaceID: 'ChIJ_9gDOjmuEmsRB7WRXm_Y6o8' } },
        { name: 'c', venue: null },
        { name: 'd', venue: null },
      ])
    )
  );

  test(
    'Filter: venue_not null',
    withKeystone(({ keystone }) =>
      match(keystone, { venue_not: null }, [
        { name: 'a', venue: { googlePlaceID: 'ChIJOza7MD-uEmsRrf4t12uji6Y' } },
        { name: 'b', venue: { googlePlaceID: 'ChIJ_9gDOjmuEmsRB7WRXm_Y6o8' } },
      ])
    )
  );

  test(
    'Filter: venue_not_in null',
    withKeystone(({ keystone }) =>
      match(keystone, { venue_not_in: [null] }, [
        { name: 'a', venue: { googlePlaceID: 'ChIJOza7MD-uEmsRrf4t12uji6Y' } },
        { name: 'b', venue: { googlePlaceID: 'ChIJ_9gDOjmuEmsRB7WRXm_Y6o8' } },
      ])
    )
  );

  test(
    'Filter: venue_in (empty list)',
    withKeystone(({ keystone }) => match(keystone, { venue_in: [] }, []))
  );

  test(
    'Filter: venue_not_in (empty list)',
    withKeystone(({ keystone }) =>
      match(keystone, { venue_not_in: [] }, [
        { name: 'a', venue: { googlePlaceID: 'ChIJOza7MD-uEmsRrf4t12uji6Y' } },
        { name: 'b', venue: { googlePlaceID: 'ChIJ_9gDOjmuEmsRB7WRXm_Y6o8' } },
        { name: 'c', venue: null },
        { name: 'd', venue: null },
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
        returnFields: 'id venue { googlePlaceID }',
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
          item: { name: '', venue: 'ChIJQaHdVx-uEmsRk0z70ZfPYok' },
          returnFields: 'id venue { googlePlaceID }',
        });
        expect(data).not.toBe(null);
        expect(data.venue.googlePlaceID).toEqual('ChIJQaHdVx-uEmsRk0z70ZfPYok');
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
          returnFields: 'id venue { googlePlaceID }',
        });

        expect(data).not.toBe(null);
        expect(data.venue.googlePlaceID).toBe(items[0].venue.googlePlaceID);
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
              data: { venue: 'ChIJeRC1LkiuEmsRAiqhKVgHRMQ' },
            },
            returnFields: 'venue { googlePlaceID }',
          });
          expect(data).not.toBe(null);
          expect(data.venue.googlePlaceID).toBe('ChIJeRC1LkiuEmsRAiqhKVgHRMQ');
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
              data: { venue: null },
            },
            returnFields: 'venue',
          });
          expect(data).not.toBe(null);
          expect(data.venue).toBe(null);
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
              data: { name: 'New location' },
            },
            returnFields: 'name venue { googlePlaceID }',
          });
          expect(data).not.toBe(null);
          expect(data.name).toBe('New location');
          expect(data.venue.googlePlaceID).toBe(items[0].venue.googlePlaceID);
        })
      )
    );
  });
};
