export const shortcuts: Record<string, string> = {
  '...': '…',
  '-->': '→',
  '->': '→',
  '<-': '←',
  '<--': '←',
  '--': '–',
  '(c)': '©',
  '(r)': '®',
  '(tm)': '™',
}

export const simpleMarkShortcuts = new Map([
  ['bold', ['**', '__']],
  ['italic', ['*', '_']],
  ['strikethrough', ['~~']],
  ['code', ['`']],
] as const)
