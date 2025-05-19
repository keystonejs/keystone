type HeadingLevels = boolean | readonly (1 | 2 | 3 | 4 | 5 | 6)[]

export type EditorConfig = {
  bold: boolean
  italic: boolean
  strikethrough: boolean
  code: boolean
  heading: { levels: readonly (1 | 2 | 3 | 4 | 5 | 6)[] }
  blockquote: boolean
  orderedList: boolean
  unorderedList: boolean
  table: boolean
  link: boolean
  divider: boolean
  codeBlock: boolean
}

export type EditorOptions = {
  bold?: boolean
  italic?: boolean
  strikethrough?: boolean
  code?: boolean
  heading?: HeadingLevels
  blockquote?: boolean
  orderedList?: boolean
  unorderedList?: boolean
  table?: boolean
  link?: boolean
  divider?: boolean
  codeBlock?: boolean
}

export function editorOptionsToConfig(options: EditorOptions): EditorConfig {
  return {
    bold: options.bold ?? true,
    italic: options.italic ?? true,
    strikethrough: options.strikethrough ?? true,
    code: options.code ?? true,
    heading: {
      levels:
        typeof options.heading === 'boolean'
          ? options.heading
            ? [1, 2, 3, 4, 5, 6]
            : []
          : (options.heading ?? [1, 2, 3, 4, 5, 6]),
    },
    blockquote: options.blockquote ?? true,
    orderedList: options.orderedList ?? true,
    unorderedList: options.unorderedList ?? true,
    table: options.table ?? true,
    link: options.link ?? true,
    divider: options.divider ?? true,
    codeBlock: options.codeBlock ?? true,
  }
}
