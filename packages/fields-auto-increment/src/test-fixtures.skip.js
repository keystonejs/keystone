// The AutoIncrement field type behaves in a way that isn't supported by
// our current uniqueness tests.
import { AutoIncrement } from './index';

export const name = 'AutoIncrement';
export { AutoIncrement as type };
export const supportsUnique = true;
