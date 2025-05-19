import { Fragment, Slice } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { dropPoint } from 'prosemirror-transform'

import type { EditorSchema } from './schema'
import { toSerialized } from './props-serialization'

export function imageDropPlugin(schema: EditorSchema) {
  return new Plugin({
    props: {
      handleDrop(view, event) {
        if (event.dataTransfer?.files.length) {
          const file = event.dataTransfer.files[0]
          let eventPos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          })
          if (!eventPos) return
          for (const [name, component] of Object.entries(schema.components)) {
            if (
              (component.kind !== 'block' && component.kind !== 'inline') ||
              !component.handleFile
            ) {
              continue
            }
            const result = component.handleFile(file)
            if (!result) continue
            ;(async () => {
              const value = await result
              const slice = Slice.maxOpen(
                Fragment.from(
                  schema.schema.nodes[name].createChecked({
                    props: toSerialized(value, component.schema),
                  })
                )
              )
              const pos = dropPoint(view.state.doc, view.state.selection.from, slice)
              if (pos === null) return
              view.dispatch(view.state.tr.replace(pos, pos, slice))
            })()
            return true
          }
        }
      },
      handlePaste(view, event) {
        if (event.clipboardData?.files.length) {
          const file = event.clipboardData.files[0]
          for (const [name, component] of Object.entries(schema.components)) {
            if (component.kind !== 'block' || !component.handleFile) continue
            const result = component.handleFile(file)
            if (!result) continue
            ;(async () => {
              const value = await result
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  schema.schema.nodes[name].createChecked({
                    props: toSerialized(value, component.schema),
                  })
                )
              )
            })()
            return true
          }
        }
      },
    },
  })
}
