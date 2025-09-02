/**
 * Turns a passed in string into a human readable label
 * @param {String} str The string to convert.
 * @returns The new string
 */
export function humanize(str: string, capitalize: boolean = true) {
  str = str.replace(/[^a-zA-Z0-9]+/g, ' ').replace(/([a-z0-9])([A-Z]+)/g, '$1 $2')

  if (!capitalize) return str
  return str
    .split(' ')
    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ')
}
