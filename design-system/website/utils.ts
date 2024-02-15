export function capitalise (s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const VOWELS = ['a', 'e', 'i', 'o', 'u']
export function aAn (before: string) {
  return `a${VOWELS.includes(before.charAt(0)) ? 'n' : ''}`
}
