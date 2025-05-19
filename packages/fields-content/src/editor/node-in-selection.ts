import { AllSelection, Plugin, TextSelection } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { classes } from './utils'

export function nodeInSelectionDecorations() {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations: Decoration[] = []
        let from: number | undefined, to: number | undefined
        if (state.selection instanceof TextSelection) {
          ;({ from, to } = state.selection)
        }
        if (state.selection instanceof AllSelection) {
          from = 0
          to = state.doc.content.size
        }
        if (from !== undefined && to !== undefined) {
          const _from = from
          const _to = to
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.isText) {
              return
            }
            const nodeFrom = pos
            const nodeTo = pos + node.nodeSize
            if (nodeFrom >= _from && nodeTo <= _to) {
              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: classes.nodeInSelection,
                })
              )
            }
          })
        }
        return DecorationSet.create(state.doc, decorations)
      },
    },
  })
}
