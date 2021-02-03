const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
import { Text } from '@keystonejs/fields';
import { LocationGoogle } from './';

export const name = 'LocationGoogle';
export const type = LocationGoogle;
export const supportsUnique = false;
export const exampleValue = () => 'ChIJOza7MD-uEmsRrf4t12uji6Y';
export const exampleValue2 = () => 'ChIJ_9gDOjmuEmsRB7WRXm_Y6o8';
export const fieldName = 'venue';
export const subfieldName = 'googlePlaceID';
export const fieldConfig = () => ({ googleMapsKey: process.env.GOOGLE_API_KEY });

export const getTestFields = () => ({
  name: { type: Text },
  venue: { type, googleMapsKey: process.env.GOOGLE_API_KEY },
});

export const initItems = () => {
  return [
    { name: 'a', venue: 'ChIJOza7MD-uEmsRrf4t12uji6Y' },
    { name: 'b', venue: 'ChIJ_9gDOjmuEmsRB7WRXm_Y6o8' },
    { name: 'c', venue: 'ChIJOza7MD-uEmsRrf4t12uji6Y' },
    { name: 'd', venue: 'ChIJP3Sa8ziYEmsRUKgyFmh9AQM' },
    { name: 'e', venue: 'ChIJIQBpAG2ahYAR_6128GcTUEo' },
    { name: 'f', venue: null },
    { name: 'g' },
  ];
};

export const storedValues = () => [
  { name: 'a', venue: { googlePlaceID: 'ChIJOza7MD-uEmsRrf4t12uji6Y' } },
  { name: 'b', venue: { googlePlaceID: 'ChIJ_9gDOjmuEmsRB7WRXm_Y6o8' } },
  { name: 'c', venue: { googlePlaceID: 'ChIJOza7MD-uEmsRrf4t12uji6Y' } },
  { name: 'd', venue: { googlePlaceID: 'ChIJP3Sa8ziYEmsRUKgyFmh9AQM' } },
  { name: 'e', venue: { googlePlaceID: 'ChIJIQBpAG2ahYAR_6128GcTUEo' } },
  { name: 'f', venue: null },
  { name: 'g', venue: null },
];

export const supportedFilters = () => ['null_equality', 'in_null_empty'];
