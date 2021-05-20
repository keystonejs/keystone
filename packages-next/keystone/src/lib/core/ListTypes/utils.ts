import { humanize } from '@keystone-next/utils-legacy';

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
