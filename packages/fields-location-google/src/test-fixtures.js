// We need a valid googleMapsKey to be added to CI to make this test runnable
import { LocationGoogle } from './';

export const name = 'Location';
export { LocationGoogle as type };
export const supportsUnique = false;
export const skipRequiredTest = true;
export const skipCrudTest = true;
export const exampleValue = '"ChIJOza7MD-uEmsRrf4t12uji6Y"';
export const fieldConfig = { googleMapsKey: 'googleMapsKey' };
