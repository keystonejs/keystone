// WARNING: this is an opinionated subject, with too many ways to do this
//   we went with a subset that we are happy with
//   see tests2/utils.test.ts for examples
export function humanize(s: string, capitalize: boolean = true) {
  // drop non-alphanumeric
  s = s.replace(/[^a-zA-Z0-9]+/g, ' ')

  // insert spaces before camels of length > 1
  for (let i = 0; i < 24; i++) { // not unbounded, shouldnt happen
    const next = s.replace(/([a-z0-9])([A-Z][A-Za-z0-9])/, '$1 $2')
    if (next === s) break
    s = next
  }

  if (!capitalize) return s
  return s
    .split(' ')
    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ')
}
