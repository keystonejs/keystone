import { Plugin } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

import { classes } from './utils'

export function placeholderPlugin(text: string) {
  return new Plugin({
    props: {
      decorations(state) {
        let doc = state.doc
        if (
          doc.childCount === 1 &&
          doc.firstChild?.isTextblock &&
          doc.firstChild.content.size === 0
        ) {
          let placeholder = document.createElement('span')
          placeholder.className = classes.placeholder
          placeholder.textContent = text

          return DecorationSet.create(doc, [Decoration.widget(1, placeholder)])
        }
      },
    },
  })
}
