import {
  type Location,
  type NodeEntry,
  type PathRef,
  type Point,
  Editor,
  Element,
  Node,
  Path,
  Text,
  Transforms,
} from 'slate'
import { type ElementFromValidation } from '../structure-validation'

export type Mark =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'superscript'
  | 'subscript'
  | 'keyboard'

export const allMarks: Mark[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'code',
  'superscript',
  'subscript',
  'keyboard',
]

const IS_MAC =
  typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)

export const modifierKeyText = IS_MAC ? '⌘' : 'Ctrl'

export function isElementActive (
  editor: Editor,
  format: Exclude<ElementFromValidation, { text: string }>['type']
) {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  })

  return !!match
}

export function clearFormatting (editor: Editor) {
  Transforms.unwrapNodes(editor, {
    match: node => node.type === 'heading' || node.type === 'blockquote' || node.type === 'code',
  })
  Transforms.unsetNodes(editor, allMarks, { match: Text.isText })
}

export function moveChildren (
  editor: Editor,
  parent: NodeEntry | Path,
  to: Path,
  shouldMoveNode: (node: Node) => boolean = () => true
) {
  const parentPath = Path.isPath(parent) ? parent : parent[1]
  const parentNode = Path.isPath(parent) ? Node.get(editor, parentPath) : parent[0]
  if (!(Element.isElement(parentNode) && Editor.isBlock(editor, parentNode))) return

  for (let i = parentNode.children.length - 1; i >= 0; i--) {
    if (shouldMoveNode(parentNode.children[i])) {
      const childPath = [...parentPath, i]
      Transforms.moveNodes(editor, { at: childPath, to })
    }
  }
}

export function insertNodesButReplaceIfSelectionIsAtEmptyParagraphOrHeading (
  editor: Editor,
  nodes: Node | Node[],
  slate?: {
    ReactEditor: {
      focus: (editor: Editor) => void
    }
  },
) {
  let pathRefForEmptyNodeAtCursor: PathRef | undefined
  const entry = Editor.above(editor, {
    match: node => node.type === 'heading' || node.type === 'paragraph',
  })
  if (entry && Node.string(entry[0]) === '') {
    pathRefForEmptyNodeAtCursor = Editor.pathRef(editor, entry[1])
  }
  Transforms.insertNodes(editor, nodes)
  const path = pathRefForEmptyNodeAtCursor?.unref()
  if (path) {
    Transforms.removeNodes(editor, { at: path })
    // even though the selection is in the right place after the removeNodes
    // for some reason the editor blurs so we need to focus it again
    slate?.ReactEditor.focus(editor)
  }
}

/**
 * This is equivalent to Editor.after except that it ignores points that have no content
 * like the point in a void text node, an empty text node and the last point in a text node
 */
// TODO: this would probably break if you were trying to get the last point in the editor?
export function EditorAfterButIgnoringingPointsWithNoContent (
  editor: Editor,
  at: Location,
  {
    distance = 1,
  }: {
    distance?: number
  } = {}
): Point | undefined {
  const anchor = Editor.point(editor, at, { edge: 'end' })
  const focus = Editor.end(editor, [])
  const range = { anchor, focus }
  let d = 0
  let target

  for (const p of Editor.positions(editor, {
    at: range,
  })) {
    if (d > distance) {
      break
    }

    // this is the important change
    const node = Node.get(editor, p.path) as Text
    if (node.text.length === p.offset) {
      continue
    }

    if (d !== 0) {
      target = p
    }

    d++
  }

  return target
}

export function nodeTypeMatcher<Type extends Element['type'][]> (
  ...args: Type
): (node: Node) => node is Element & { type: Type[number] } {
  if (args.length === 1) {
    const type = args[0]
    return ((node: Node) => node.type === type) as any
  }
  const set = new Set(args)
  return ((node: Node) => typeof node.type === 'string' && set.has(node.type)) as any
}

export function assert (condition: boolean): asserts condition {
  if (!condition) {
    throw new Error('failed assert')
  }
}
