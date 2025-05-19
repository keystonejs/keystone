import { GapCursor } from '../gapcursor/gapcursor'
import type { Mark, Node } from 'prosemirror-model'
import type {
  EditorState,
  Selection} from 'prosemirror-state';
import {
  TextSelection,
  NodeSelection,
  AllSelection,
} from 'prosemirror-state'
import type { ReactNode, ReactElement } from 'react';
import { createElement } from 'react'

function cursorInText(
  text: string,
  anchorOffset: number | undefined,
  headOffset: number | undefined,
  storedMarks: readonly Mark[] | null
): ReactNode {
  if (anchorOffset === undefined && headOffset === undefined) {
    return text
  }
  const headProps: Record<string, unknown> =
    storedMarks === null ? {} : { marks: serializeMarks(storedMarks) }
  if (anchorOffset !== undefined && headOffset !== undefined) {
    if (anchorOffset === headOffset) {
      return [
        text.slice(0, anchorOffset) || undefined,
        createElement('cursor', headProps),
        text.slice(anchorOffset) || undefined,
      ]
    }
    const startOffset = Math.min(anchorOffset, headOffset)
    const endOffset = Math.max(anchorOffset, headOffset)
    const headElement = createElement('head', headProps)
    const anchorElement = createElement('anchor')

    return [
      text.slice(0, startOffset) || undefined,
      startOffset === anchorOffset ? anchorElement : headElement,
      text.slice(startOffset, endOffset) || undefined,
      endOffset === anchorOffset ? anchorElement : headElement,
      text.slice(endOffset) || undefined,
    ]
  }
  if (anchorOffset !== undefined) {
    return [
      text.slice(0, anchorOffset) || undefined,
      createElement('anchor'),
      text.slice(anchorOffset) || undefined,
    ]
  }
  if (headOffset !== undefined) {
    return [
      text.slice(0, headOffset) || undefined,
      createElement('head', headProps),
      text.slice(headOffset) || undefined,
    ]
  }
}

function serializeMarks(marks: readonly Mark[]) {
  const serialized: Record<string, unknown> = {}
  for (const mark of marks) {
    if (mark.type.name in serialized) {
      throw new Error(`text node has multiple marks of the same type: ${mark.type.name}`)
    }
    serialized[mark.type.name] = Object.keys(mark.attrs).length > 0 ? mark.attrs : true
  }
  return serialized
}

// we're converting the doc to react elements because Jest
// knows how to pretty-print react elements in snapshots
function nodeToReactElement(
  node: Node,
  selection: Selection,
  storedMarks: readonly Mark[] | null
): ReactElement | ReactElement[] {
  if (node.isText) {
    const { $anchor, $head } = selection
    const isAnchorInNode = $anchor.doc.nodeAt($anchor.pos - $anchor.textOffset) === node
    const isHeadInNode = $head.doc.nodeAt($head.pos - $head.textOffset) === node
    const text = node.text!
    const props: Record<string, unknown> = {
      children: cursorInText(
        node.text!,
        $anchor.nodeBefore === node ? text.length : isAnchorInNode ? $anchor.textOffset : undefined,
        $head.nodeBefore === node ? text.length : isHeadInNode ? $head.textOffset : undefined,
        storedMarks
      ),
      ...serializeMarks(node.marks),
    }

    return createElement('text', props)
  }

  if (node.marks.length) {
    throw new Error(`non-text node has marks: ${node.marks.map(mark => mark.type.name)}`)
  }

  const children: ReactNode[] = []
  node.content.forEach(node => {
    children.push(nodeToReactElement(node, selection, storedMarks))
  })

  if (!children.length && selection instanceof TextSelection) {
    if (selection.$cursor && selection.$cursor.parent === node) {
      children.push(createElement('cursor'))
    } else if (selection.$anchor.parent === node) {
      children.push(createElement('anchor'))
    } else if (selection.$head.parent === node) {
      children.push(createElement('head'))
    }
  }

  const element = createElement(node.type.name, {
    ...node.attrs,
    children,
  })
  if (selection instanceof NodeSelection && selection.node === node) {
    return createElement('node_selection', { children: element })
  }
  if (selection instanceof GapCursor) {
    const $pos = selection.$anchor
    if ($pos.nodeBefore === node && $pos.nodeAfter === null) {
      return [element, createElement('gap_cursor')]
    }
    if ($pos.nodeAfter === node) {
      return [createElement('gap_cursor'), element]
    }
  }
  return element
}

export function editorStateToReactNode(state: EditorState): ReactNode {
  if (
    !(state.selection instanceof TextSelection) &&
    !(state.selection instanceof NodeSelection) &&
    !(state.selection instanceof GapCursor) &&
    !(state.selection instanceof AllSelection)
  ) {
    console.log(state.selection)
    throw new Error(`no serialization for selection type: ${state.selection}`)
  }
  if (state.storedMarks && !(state.selection instanceof TextSelection)) {
    throw new Error('unexpected stored marks without text selection')
  }
  return nodeToReactElement(state.doc, state.selection, state.storedMarks) as ReactElement
}
