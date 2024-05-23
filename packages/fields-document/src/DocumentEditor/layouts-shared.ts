import { Editor, Element, Node, Transforms, Range, Point } from 'slate'
import { paragraphElement } from './paragraphs'
import {
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading,
  moveChildren,
} from './utils'

export function insertLayout (editor: Editor, layout: [number, ...number[]]) {
  insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading(editor, [
    {
      type: 'layout',
      layout,
      children: [
        { type: 'layout-area', children: [{ type: 'paragraph', children: [{ text: '' }] }] },
      ],
    },
  ])
  const layoutEntry = Editor.above(editor, { match: x => x.type === 'layout' })
  if (layoutEntry) {
    Transforms.select(editor, [...layoutEntry[1], 0])
  }
}

// Plugin
export function withLayouts (editor: Editor): Editor {
  const { normalizeNode, deleteBackward } = editor
  editor.deleteBackward = unit => {
    if (
      editor.selection &&
      Range.isCollapsed(editor.selection) &&
      // this is just an little optimisation
      // we're only doing things if we're at the start of a layout area
      // and the start of anything will always be offset 0
      // so we'll bailout if we're not at offset 0
      editor.selection.anchor.offset === 0
    ) {
      const [aboveNode, abovePath] = Editor.above(editor, {
        match: node => node.type === 'layout-area',
      }) || [editor, []]
      if (
        aboveNode.type === 'layout-area' &&
        Point.equals(Editor.start(editor, abovePath), editor.selection.anchor)
      ) {
        return
      }
    }
    deleteBackward(unit)
  }
  editor.normalizeNode = entry => {
    const [node, path] = entry

    if (Element.isElement(node) && node.type === 'layout') {
      if (node.layout === undefined) {
        Transforms.unwrapNodes(editor, { at: path })
        return
      }
      if (node.children.length < node.layout.length) {
        Transforms.insertNodes(
          editor,
          Array.from({
            length: node.layout.length - node.children.length,
          }).map(() => ({
            type: 'layout-area',
            children: [paragraphElement()],
          })),
          {
            at: [...path, node.children.length],
          }
        )
        return
      }
      if (node.children.length > node.layout.length) {
        Array.from({
          length: node.children.length - node.layout.length,
        })
          .map((_, i) => i)
          .reverse()
          .forEach(i => {
            const layoutAreaToRemovePath = [...path, i + node.layout.length]
            const child = node.children[i + node.layout.length] as Element
            moveChildren(
              editor,
              layoutAreaToRemovePath,
              [
                ...path,
                node.layout.length - 1,
                (node.children[node.layout.length - 1] as Element).children.length,
              ],
              node => node.type !== 'paragraph' || Node.string(child) !== ''
            )

            Transforms.removeNodes(editor, {
              at: layoutAreaToRemovePath,
            })
          })
        return
      }
    }
    normalizeNode(entry)
  }
  return editor
}

