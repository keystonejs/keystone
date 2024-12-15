import {
  Editor,
  Element,
  Node,
  Path,
  Point,
  Text,
  Transforms,
} from 'slate'

const nodeListsWithoutInsertMenu = new WeakSet<Node[]>()

const nodesWithoutInsertMenu = new WeakSet<Node>()

function findPathWithInsertMenu (node: Node, path: Path): Path | undefined {
  if (Text.isText(node)) return node.insertMenu ? path : undefined
  if (nodeListsWithoutInsertMenu.has(node.children)) return

  for (const [index, child] of node.children.entries()) {
    if (nodesWithoutInsertMenu.has(child)) continue
    const maybePath = findPathWithInsertMenu(child, [...path, index])
    if (maybePath) {
      return maybePath
    }
    nodesWithoutInsertMenu.add(child)
  }
  nodeListsWithoutInsertMenu.add(node.children)
}

function removeInsertMenuMarkWhenOutsideOfSelection (editor: Editor) {
  const path = findPathWithInsertMenu(editor, [])
  if (
    path &&
    !Editor.marks(editor)?.insertMenu &&
    (!editor.selection ||
      !Path.equals(editor.selection.anchor.path, path) ||
      !Path.equals(editor.selection.focus.path, path))
  ) {
    Transforms.unsetNodes(editor, 'insertMenu', { at: path })
    return true
  }
  return false
}

export function withInsertMenu (editor: Editor): Editor {
  const { normalizeNode, apply, insertText } = editor
  editor.normalizeNode = ([node, path]) => {
    if (Text.isText(node) && node.insertMenu) {
      if (node.text[0] !== '/') {
        Transforms.unsetNodes(editor, 'insertMenu', { at: path })
        return
      }
      const whitespaceMatch = /\s/.exec(node.text)
      if (whitespaceMatch) {
        Transforms.unsetNodes(editor, 'insertMenu', {
          at: {
            anchor: { path, offset: whitespaceMatch.index },
            focus: Editor.end(editor, path),
          },
          match: Text.isText,
          split: true,
        })
        return
      }
    }
    if (Editor.isEditor(editor) && removeInsertMenuMarkWhenOutsideOfSelection(editor)) {
      return
    }
    normalizeNode([node, path])
  }

  editor.apply = op => {
    apply(op)
    // we're calling this here AND in normalizeNode
    // because normalizeNode won't be called on selection changes
    // but apply will
    // we're still calling this from normalizeNode though because we want it to happen
    // when normalization happens
    if (op.type === 'set_selection') {
      removeInsertMenuMarkWhenOutsideOfSelection(editor)
    }
  }

  editor.insertText = text => {
    insertText(text)
    if (editor.selection && text === '/') {
      const startOfBlock = Editor.start(
        editor,
        Editor.above(editor, {
          match: node => Element.isElement(node) && Editor.isBlock(editor, node),
        })![1]
      )
      const before = Editor.before(editor, editor.selection.anchor, { unit: 'character' })
      if (
        before &&
        (Point.equals(startOfBlock, before) ||
          (before.offset !== 0 &&
            /\s/.test((Node.get(editor, before.path) as Text).text[before.offset - 1])))
      ) {
        Transforms.setNodes(
          editor,
          { insertMenu: true },
          {
            at: { anchor: before, focus: editor.selection.anchor },
            match: Text.isText,
            split: true,
          }
        )
      }
    }
  }
  return editor
}
