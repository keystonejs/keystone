/**
 * Turns a passed in string into
 * a human readable label
 * @param {String} str The string to convert.
 * @returns The new string
 */
export function humanize (str: string) {
  return str
    .replace(/([a-z])([A-Z]+)/g, '$1 $2')
    .split(/\s|_|-/)
    .filter(i => i)
    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ')
}
