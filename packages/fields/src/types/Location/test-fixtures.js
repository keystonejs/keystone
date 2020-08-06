// We need a valid googleMapsKey to be added to CI to make this test runnable
import Location from './';

export const name = 'Location';
export { Location as type };
export const supportsUnique = false;
export const skipRequiredTest = true;
export const exampleValue = '"ChIJOza7MD-uEmsRrf4t12uji6Y"';
export const fieldConfig = { googleMapsKey: 'googleMapsKey' };
