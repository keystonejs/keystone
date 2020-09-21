import { promisify } from 'util';

export const exec = promisify(require('child_process').exec);

export const upcase = (str: string) => str.substr(0, 1).toUpperCase() + str.substr(1);
export const downcase = (str: string) => str.substr(0, 1).toLowerCase() + str.substr(1);

export const keyToLabel = (str: string) =>
  str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s|_|\-/)
    .filter(i => i)
    .map(upcase)
    .join(' ');

export const labelToPath = (str: string) => str.split(' ').join('-').toLowerCase();

export const labelToClass = (str: string) => str.replace(/\s+/g, '');
