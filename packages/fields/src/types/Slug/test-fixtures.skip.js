// Slug handles uniqueness in a very different way to most other
// fields, so the generic uniqueness tests don't make sense for it.
import Slug from './';

export const name = 'Slug';
export { Slug as type };
export const exampleValue = '"foo"';
export const exampleValue2 = '"bar"';
export const supportsUnique = true;
