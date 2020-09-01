// We need a valid googleMapsKey to be added to CI to make this test runnable
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import { getItems } from '@keystonejs/server-side-graphql-client';
import { LocationGoogle } from './';

// Field's configuration
export const name = 'Location';
export { LocationGoogle as type };
export const supportsUnique = false;
export const skipRequiredTest = false;
export const exampleValue = 'ChIJOza7MD-uEmsRrf4t12uji6Y';
export const exampleValue2 = 'ChIJ_9gDOjmuEmsRB7WRXm_Y6o8';
export const fieldName = 'venue';
export const subfieldName = 'googlePlaceID';
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
        listKey: 'Test',
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
