import { Implementation } from '@keystone-next/fields';
import { humanize, resolveAllKeys, arrayToObject } from '@keystone-next/utils-legacy';

export const keyToLabel = (str: string) => {
  let label = humanize(str);

  // Retain the leading underscore for auxiliary lists
  if (str[0] === '_') {
    label = `_${label}`;
  }
  return label;
};

export const labelToPath = (str: string) => str.split(' ').join('-').toLowerCase();

export const labelToClass = (str: string) => str.replace(/\s+/g, '');

export const opToType = {
  read: 'query',
  create: 'mutation',
  update: 'mutation',
  delete: 'mutation',
} as const;

export const mapToFields = <F extends Implementation<any>>(
  fields: F[],
  action: (f: F) => Promise<unknown>
) =>
  resolveAllKeys(arrayToObject(fields, 'path', action)).catch(error => {
    if (!error.errors) {
      throw error;
    }
    const errorCopy = new Error(error.message || error.toString());
    // @ts-ignore
    errorCopy.errors = Object.values(error.errors);
    throw errorCopy;
  });
